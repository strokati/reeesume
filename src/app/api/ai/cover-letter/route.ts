import { auth } from '@/lib/auth/config';
import { generateCoverLetter } from '@/lib/ai/operations/cover-letter';
import { db } from '@/lib/db/client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session?.user?.id ?? 'local-user';

  let body: { applicationId?: string; tone?: string; providerId?: string; draftId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { applicationId, tone, providerId, draftId } = body;
  if (!applicationId || !tone || !providerId) {
    return new Response('Missing applicationId, tone, or providerId', { status: 400 });
  }

  if (!['professional', 'confident', 'warm'].includes(tone)) {
    return new Response('Invalid tone. Must be: professional, confident, or warm.', {
      status: 400,
    });
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { vacancy: true },
  });

  if (!application || application.vacancy?.userId !== userId) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const result = await generateCoverLetter(
      userId,
      applicationId,
      tone as 'professional' | 'confident' | 'warm',
      providerId
    );

    // Create or update cover letter draft after streaming
    void result.text.then(async (text) => {
      if (text) {
        try {
          if (draftId) {
            await db.coverLetterDraft.update({
              where: { id: draftId },
              data: {
                content: text,
                tone,
                status: 'draft',
              },
            });
          } else {
            const count = await db.coverLetterDraft.count({
              where: { applicationId },
            });
            await db.coverLetterDraft.create({
              data: {
                applicationId,
                name: `Draft ${count + 1}`,
                content: text,
                tone,
              },
            });
          }
        } catch (err) {
          console.error('Failed to save cover letter draft:', err);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Cover letter generation failed', {
      status: 500,
    });
  }
}
