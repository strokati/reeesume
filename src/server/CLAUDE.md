# Server Layer — Conventions

## Server Actions vs API Routes

- **Server Actions** (`"use server"`) — for all form mutations: create, update, delete. Files go in `src/server/actions/[domain].ts`.
- **API Route Handlers** — only for streaming AI responses and file upload/download. Files go in `src/app/api/[domain]/route.ts`.
- Never call Prisma directly from Client Components.

## Auth guard (use in every Server Component and Server Action)

```ts
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

const session = await auth();
if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
const userId = session?.user?.id ?? 'local-user';
```

In API routes, return 401 instead of redirect:

```ts
const session = await auth();
if (!session && process.env.AUTH_MODE === 'email_otp') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session?.user?.id ?? 'local-user';
```

## Prisma patterns

- Singleton: import `db` from `@/lib/db/client`.
- Query helpers: `src/server/queries/[domain].ts` — typed wrappers around Prisma calls.
- Always select specific fields when you don't need the full record.
- Use transactions (`db.$transaction`) for multi-step writes.

## Zod validation schemas

- Define in `src/lib/validations/[domain].ts`.
- Import the same schema in both the Server Action (server validation) and React Hook Form (client validation).
- Never trust client-side validation alone — always validate on the server.

## File naming

- Server actions: `server/actions/[domain].ts` (kebab-case)
- Query helpers: `server/queries/[domain].ts` (kebab-case)
