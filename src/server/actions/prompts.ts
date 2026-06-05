'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { upsertPromptSchema, resetPromptSchema } from '@/lib/validations/prompts';
import { getPromptTemplate } from '@/lib/ai/prompts/defaults';

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  return session?.user?.id ?? 'local-user';
}

export async function getPromptOverrides() {
  const userId = await requireAuth();

  return db.aiPromptOverride.findMany({
    where: { userId },
    select: { promptKey: true, template: true, updatedAt: true },
    orderBy: { promptKey: 'asc' },
  });
}

export async function upsertPromptOverride(key: string, template: string) {
  const userId = await requireAuth();
  const validated = upsertPromptSchema.parse({ key, template });

  const promptTemplate = getPromptTemplate(validated.key);
  if (!promptTemplate) throw new Error(`Unknown prompt key: ${validated.key}`);

  await db.aiPromptOverride.upsert({
    where: { userId_promptKey: { userId, promptKey: validated.key } },
    update: { template: validated.template.trim() },
    create: { userId, promptKey: validated.key, template: validated.template.trim() },
  });
}

export async function resetPromptOverride(key: string) {
  const userId = await requireAuth();
  const validated = resetPromptSchema.parse({ key });

  await db.aiPromptOverride.deleteMany({
    where: { userId, promptKey: validated.key },
  });
}

export async function resetAllPromptOverrides() {
  const userId = await requireAuth();

  await db.aiPromptOverride.deleteMany({
    where: { userId },
  });
}
