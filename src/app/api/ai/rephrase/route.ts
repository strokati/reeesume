import { auth } from '@/lib/auth/config';
import { assertSameOrigin } from '@/lib/auth/csrf';
import { rephraseBullet } from '@/lib/ai/operations/rephrase';
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

  let body: {
    original?: string;
    direction?: string;
    context?: string;
    providerId?: string;
    language?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { original, direction, context, providerId, language } = body;
  if (!original || !direction || !providerId) {
    return new Response('Missing original, direction, or providerId', { status: 400 });
  }

  const validDirections = ['stronger', 'concise', 'quantified', 'formal', 'casual'];
  if (!validDirections.includes(direction)) {
    return new Response(`Invalid direction. Must be one of: ${validDirections.join(', ')}`, {
      status: 400,
    });
  }

  try {
    const result = await rephraseBullet(
      original,
      direction as 'stronger' | 'concise' | 'quantified' | 'formal' | 'casual',
      context ?? '',
      providerId,
      userId,
      language
    );
    return result.toTextStreamResponse();
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Rephrase failed', { status: 500 });
  }
}
