import { auth } from '@/lib/auth/config';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { getResumeSuggestions } from '@/lib/ai/operations/resume-suggestions';
import { db } from '@/lib/db/client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
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

  let body: { applicationId?: string; providerId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { applicationId, providerId } = body;
  if (!applicationId || !providerId) {
    return new Response('Missing applicationId or providerId', { status: 400 });
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { vacancy: true },
  });

  if (!application || application.vacancy.userId !== userId) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const result = await getResumeSuggestions(userId, applicationId, providerId);
    return result.toTextStreamResponse();
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Suggestions failed', { status: 500 });
  }
}
