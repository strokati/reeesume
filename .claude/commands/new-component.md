# New Component

Create a typed React component for the MasterResume app.

## Arguments

$ARGUMENTS — component name and location, e.g. `TrackerTable in components/tracker` or `WorkExperienceCard in components/master-resume`

## Template

```tsx
// src/components/[location]/[ComponentName].tsx
import { cn } from "@/lib/utils"

interface [ComponentName]Props {
  // Define all props with explicit types
  // Use optional (?) for non-required props
  className?: string
}

export function [ComponentName]({ className }: [ComponentName]Props) {
  return (
    <div className={cn("", className)}>
      {/* implementation */}
    </div>
  )
}
```

## Conventions

### Choose the right rendering mode

- **Server Component** (default, no directive): for display-only components that receive data as props.
- **Client Component** (`"use client"` at top): for components with state, event handlers, hooks, or browser APIs.

### Data access

- Server Components may import and call query helpers from `src/server/queries/`.
- Client Components **must not** import Prisma or server-only modules.
- Client Components receive data as props (from a Server Component parent) or fetch via TanStack Query.

### Styling

- Use `cn()` from `@/lib/utils` to merge Tailwind classes.
- Use shadcn/ui primitives from `@/components/ui/` before writing custom markup.
- Follow Tailwind class order: layout → spacing → sizing → typography → color → interactive.

### Props pattern for complex components

```tsx
// For table-like components
interface TrackerTableProps {
	applications: ApplicationWithVacancy[]; // use Prisma-generated types + your joins
	onStatusChange: (id: string, status: ApplicationStatus) => void;
	className?: string;
}

// For form components
interface SkillFormProps {
	initial?: Partial<Skill>; // undefined = create mode, defined = edit mode
	resumeId: string;
	onSuccess?: () => void;
}
```

### Index barrel exports

After creating a component, add it to the folder's `index.ts` if one exists:

```ts
export { [ComponentName] } from "./[ComponentName]"
```

### Avoid

- Default exports (prefer named exports for tree-shaking and refactoring).
- Inline styles (use Tailwind).
- Direct `fetch` calls inside components (use TanStack Query or Server Components).
