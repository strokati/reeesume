import { PDFParse } from 'pdf-parse';
import { auth } from '@/lib/auth/config';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { importResume } from '@/lib/ai/operations/import-resume';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch {
    return new Response('Forbidden', { status: 403 });
  }
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session?.user?.id ?? 'local-user';

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const providerId = formData.get('providerId') as string | null;

  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }
  if (!providerId) {
    return new Response('Missing providerId', { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return new Response('Only PDF and DOCX files are accepted', { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return new Response('File too large. Maximum size is 5 MB.', { status: 413 });
  }

  let fileText: string;

  if (file.type === 'application/pdf') {
    const uint8 = new Uint8Array(await file.arrayBuffer());
    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    fileText = result.text;
  } else {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    fileText = result.value;
  }

  if (!fileText.trim()) {
    return new Response('Could not extract text from file. It may be empty or image-based.', {
      status: 400,
    });
  }

  try {
    const streamResult = await importResume(userId, fileText, providerId);

    // Stream partialObjectStream as newline-delimited JSON (one snapshot per line).
    // This is more reliable than textStream, which may emit incomplete JSON fragments.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const partial of streamResult.partialObjectStream) {
            controller.enqueue(encoder.encode(JSON.stringify(partial) + '\n'));
          }
          controller.close();
        } catch (streamErr) {
          console.error('[import-resume] Stream error:', streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[import-resume] Error:', message);
    return new Response(message || 'Import failed', { status: 500 });
  }
}
