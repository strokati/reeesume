# New Database Model

Add a new Prisma model to the MasterResume schema, run a migration, and wire up type-safe query helpers.

## Arguments

$ARGUMENTS — the model name and a one-line description, e.g. `Skill - represents a skill or interest on the master resume`

## Steps to follow

### 1. Edit `prisma/schema.prisma`

Add the new model. Follow these conventions:

- Use `cuid()` for `id` (default).
- Always add `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Use `Json` type for flexible/structured blob fields.
- Add proper foreign key relations with `onDelete: Cascade` for owned records.
- Add `@@map("snake_case_table_name")` for explicit table naming.

Example pattern:

```prisma
model Skill {
  id         String      @id @default(cuid())
  name       String
  category   String?
  level      String?     // "Beginner" | "Intermediate" | "Expert"
  resume     MasterResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  resumeId   String
  order      Int         @default(0)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@map("skills")
}
```

Also add the relation field on the parent model (e.g., `skills Skill[]` on `MasterResume`).

### 2. Run migration

```bash
npx prisma migrate dev --name add_[model_name_snake_case]
```

This also regenerates the Prisma client.

### 3. Create query helpers in `src/server/queries/`

Add functions to the relevant domain file (or create a new one):

```ts
// src/server/queries/master-resume.ts
import { db } from '@/lib/db/client';
import type { Skill, Prisma } from '@prisma/client';

export async function getSkillsByResumeId(resumeId: string): Promise<Skill[]> {
  return db.skill.findMany({
    where: { resumeId },
    orderBy: { order: 'asc' },
  });
}

export async function createSkill(
  resumeId: string,
  data: Prisma.SkillCreateWithoutResumeInput
): Promise<Skill> {
  return db.skill.create({
    data: { ...data, resumeId },
  });
}
```

### 4. Add Server Actions in `src/server/actions/`

```ts
// src/server/actions/master-resume.ts
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';

const CreateSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Expert']).optional(),
});

export async function createSkillAction(
  resumeId: string,
  formData: z.infer<typeof CreateSkillSchema>
) {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');

  const parsed = CreateSkillSchema.safeParse(formData);
  if (!parsed.success) throw new Error('Invalid input');

  await db.skill.create({ data: { ...parsed.data, resumeId } });
  revalidatePath('/master-resume');
}
```

## Conventions

- Never import from `@prisma/client` in Client Components.
- Query helpers are server-only — do not add `"use server"`, they aren't actions.
- Actions always validate with Zod, always check auth, always revalidatePath.
