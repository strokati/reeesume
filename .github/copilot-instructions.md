# Copilot Instructions — Reeesume

## Project overview

Private career management app: MasterResume (permanent data) + Job Applications (temporary output). AI assists but never silently modifies master data. Built with Next.js 15, Prisma, PostgreSQL, Vercel AI SDK, Tailwind + shadcn/ui.

## Conventions

### Server vs Client

- Server Actions (`"use server"`) for all mutations.
- API Routes only for streaming AI and file uploads.
- Never call Prisma from Client Components.

### Auth guard (every server entry point)

```ts
const session = await auth();
if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
const userId = session?.user?.id ?? 'local-user';
```

### File naming

- Components: `PascalCase.tsx`
- Lib/hooks: `kebab-case.ts`
- Server actions: `server/actions/[domain].ts`

### AI content colors

- Blue (`text-blue-600`) = master data
- Orange (`text-orange-600`) = AI-suggested
- Green (`text-green-600`) = edited

### Component rules

- Named exports only.
- Use `cn()` from `@/lib/utils` for Tailwind merging.
- `ui/` components are shadcn/ui auto-generated — do not edit.
- `'use client'` only when state/events/hooks are needed.

### AI operations

All AI calls use Vercel AI SDK `streamText`. Provider configs are user-managed in DB (Settings UI). Route returns `result.toDataStreamResponse()`.

### Deployment modes

- `AUTH_MODE=none` — local Docker, no auth.
- `AUTH_MODE=email_otp` — self-hosted, OTP login.
