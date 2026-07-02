<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Reeesume — Agent Instructions

## What This App Does

Reeesume is a private, local-first career management web app. It maintains a MasterResume (permanent career data) separate from job applications (temporary output). AI assists with tailoring resumes, drafting cover letters, and ATS checks — but never silently modifies master data.

## Tech Stack

| Layer         | Choice                                         |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 15 (App Router, React 19, TS)          |
| Styling       | Tailwind CSS + shadcn/ui                       |
| Rich text     | Tiptap                                         |
| Drag and drop | @dnd-kit                                       |
| Forms         | React Hook Form + Zod                          |
| Data fetching | TanStack Query                                 |
| ORM           | Prisma                                         |
| Database      | PostgreSQL 16                                  |
| Auth          | Auth.js v5 (Email OTP; disabled in local mode) |
| AI            | Vercel AI SDK (multi-provider, streaming)      |
| Export        | Puppeteer (PDF), docx (DOCX)                   |

## Key Conventions

### Server vs Client

- **Server Actions** (`"use server"`) — all mutations (create, update, delete).
- **API Routes** — only for streaming AI responses and file upload/download.
- **Never** call Prisma from Client Components.

### Auth guard (every server entry point)

```ts
const session = await auth();
if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
const userId = session?.user?.id ?? 'local-user';
```

### File naming

- Components: `PascalCase.tsx`
- Lib/hooks/utils: `kebab-case.ts`
- Server actions: `server/actions/[domain].ts`
- Query helpers: `server/queries/[domain].ts`

### AI operations pattern

```
Client hook (useCompletion)
  → API route (src/app/api/ai/[op]/route.ts)
    → Operation (src/lib/ai/operations/[name].ts)
      → getProviderForUser() from providers.ts
```

Route returns `result.toDataStreamResponse()`. All providers configured via Settings UI (keys stored in DB).

### AI content colors

- **Blue** = original master data
- **Orange** = AI-suggested
- **Green** = manually edited

### Component rules

- Named exports only. No default exports.
- Use `cn()` for Tailwind class merging.
- shadcn/ui components in `ui/` are auto-generated — do not edit.
- Use `'use client'` only when state/events/hooks/browser APIs are needed.

### Deployment modes

- `AUTH_MODE=none` — local Docker, no login, `userId` is `"local-user"`.
- `AUTH_MODE=email_otp` — self-hosted, OTP to `ALLOWED_EMAIL`, session via Auth.js.

### Commit format

Conventional Commits: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `test`, `ci`, `revert`. Lowercase subject, no trailing period, max 100 chars.
