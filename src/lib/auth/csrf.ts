/**
 * Same-origin guard for Next.js API route handlers.
 *
 * Server Actions get CSRF protection from Next.js itself (the Action ID is a
 * non-guessable token). API routes (route.ts handlers) do not — they rely on
 * the session cookie, which is SameSite=Lax. Lax blocks cross-site POSTs from
 * forms but does NOT block fetch() with credentials:'include' under all
 * browser policies.
 *
 * Every POST/PUT/PATCH/DELETE handler under src/app/api/ should call this at
 * the top. Mismatches throw; the route handler should catch and return 403.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) {
    throw new Error('Missing Origin or Host header');
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error('Invalid Origin header');
  }
  if (originHost !== host) {
    throw new Error('Origin does not match Host');
  }
}
