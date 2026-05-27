# New Page

Scaffold a complete new page for the MasterResume app (Next.js 15 App Router).

## Arguments

$ARGUMENTS — the route path under `src/app/(app)/`, e.g. `tracker` or `applications/[id]/notes`

## What to create

1. **`src/app/(app)/$ARGUMENTS/page.tsx`** — Server Component.
   - Import and call `auth()` + check session (see auth guard pattern in CLAUDE.md).
   - Fetch initial data using a query helper from `src/server/queries/`.
   - Render `<PageHeader />` from `@/components/shared/PageHeader`.
   - Render a `<XxxView />` client component (see step 4).
   - Add `export const dynamic = "force-dynamic"` if the page always needs fresh data.

2. **`src/app/(app)/$ARGUMENTS/loading.tsx`** — Skeleton loading state.
   - Import `Skeleton` from `@/components/ui/skeleton`.
   - Mirror the rough layout of the page (header + content area).

3. **`src/app/(app)/$ARGUMENTS/error.tsx`** — Error boundary.

   ```tsx
   "use client"
   export default function Error({ error, reset }: { error: Error; reset: () => void }) { ... }
   ```

4. **`src/app/(app)/$ARGUMENTS/_components/[PageName]View.tsx`** — Client Component (`"use client"`).
   - Receives initial data as props.
   - Uses TanStack Query `useQuery` with `initialData` prop to avoid duplicate fetch.
   - Contains the interactive UI.

5. **`src/server/queries/[domain].ts`** — add (or extend) a typed query helper.

   ```ts
   import { db } from "@/lib/db/client"
   export async function getXxx(userId: string) { ... }
   ```

6. **`src/server/actions/[domain].ts`** — add (or extend) with any needed mutations.
   - Must have `"use server"` at top.
   - Validate input with Zod before calling Prisma.
   - Call `revalidatePath()` after mutations.

## Conventions

- Follow the auth guard pattern from CLAUDE.md exactly.
- Never call Prisma from a Client Component.
- Co-locate page-specific components in `_components/` next to `page.tsx`.
