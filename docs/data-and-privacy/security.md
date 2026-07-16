# Security posture

This document explains how Reeesume protects authenticated routes against cross-site request forgery (CSRF) and related confusion attacks. It is intended for self-hosters and contributors reviewing changes to auth-adjacent code.

## Two surfaces, two defenses

| Surface                         | Protection                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| Server Actions (`'use server'`) | Next.js built-in CSRF tokens (Action IDs). Default is same-origin only. |
| API routes (`src/app/api/**`)   | `assertSameOrigin(req)` + `SameSite=Lax` session cookie.                |

## Server Actions

`next.config.ts` declares the Next.js server-action CSRF default explicitly:

```ts
experimental: {
  serverActions: {
    bodySizeLimit: '50mb',
    allowedOrigins: undefined, // rely on Next.js default (same-origin only)
  },
},
```

`allowedOrigins: undefined` is the secure default — kept explicit so future readers know it was a deliberate choice and a future config change doesn't silently widen the policy.

## API routes

Every POST handler under `src/app/api/` starts with:

```ts
try {
  assertSameOrigin(req);
} catch {
  return new Response('Forbidden', { status: 403 });
}
```

`assertSameOrigin` (in `src/lib/auth/csrf.ts`) compares the `Origin` request header's host portion against the `Host` header. If they differ, or either is missing, the request is rejected with 403.

This is paired with the session cookie's `SameSite=Lax` flag, which blocks cross-site POST requests from forms in browsers. Lax does not block all `fetch()` cross-origin requests under every browser policy, so the server-side `assertSameOrigin` check is the second layer of defense.

## Auth.js session cookie

Explicit flags in `src/lib/auth/config.ts`:

```ts
cookies: {
  sessionToken: {
    name: 'authjs.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

- `httpOnly` — JavaScript on the page cannot read the cookie (XSS exfiltration defense).
- `sameSite: 'lax'` — top-level cross-site navigations still send the cookie, but cross-site POST/fetch does not.
- `secure` — only set over HTTPS in production. Disabled in dev so `http://localhost` works.

## What this protects against

- Cross-site form POSTs from a malicious page while the user is logged in.
- Cross-site `fetch()` calls with `credentials: 'include'` from a malicious origin.
- Confused-deputy attacks where a third-party site tricks the user's browser into hitting a Reeesume endpoint.

## What it does NOT protect against

- XSS within the Reeesume origin — once an attacker runs JS on the origin, all same-origin checks pass. Tiptap HTML in cover-letter exports is sanitized separately (see `src/lib/export/sanitize-html.ts` once p20-08 lands).
- Physical or root access to the user's machine — local-first apps assume the OS is trusted.
- Network-level MitM — assume HTTPS termination at your reverse proxy.

## Reporting

See [SECURITY.md](../../.github/SECURITY.md) (once p20-17 lands) for the vulnerability disclosure process.
