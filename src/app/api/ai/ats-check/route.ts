import { auth } from '@/lib/auth/config';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { runAtsCheck } from '@/lib/ai/operations/ats-check';
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

  let body: { resumeDraftId?: string; providerId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { resumeDraftId, providerId } = body;
  if (!resumeDraftId || !providerId) {
    return new Response('Missing resumeDraftId or providerId', { status: 400 });
  }

  const draft = await db.resumeDraft.findUnique({
    where: { id: resumeDraftId },
    include: { application: { include: { vacancy: true } } },
  });

  if (!draft || draft.application.vacancy?.userId !== userId) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const result = await runAtsCheck(userId, resumeDraftId, providerId);
    return result.toTextStreamResponse();
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'ATS check failed', { status: 500 });
  }
}
