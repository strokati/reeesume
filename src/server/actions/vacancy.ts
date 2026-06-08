'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import type { VacancyAnalysis } from '@/types/vacancy-analysis';

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  return session?.user?.id ?? 'local-user';
}

export async function saveVacancyAnalysis(
  vacancyId: string,
  analysis: VacancyAnalysis
): Promise<void> {
  const userId = await requireAuth();

  const vacancy = await db.vacancy.findUnique({ where: { id: vacancyId } });
  if (!vacancy || vacancy.userId !== userId) {
    throw new Error('Vacancy not found.');
  }

  try {
    await db.vacancy.update({
      where: { id: vacancyId },
      data: { aiAnalysis: analysis as unknown as Record<string, never> },
    });
  } catch {
    throw new Error('Failed to save vacancy analysis.');
  } finally {
    revalidatePath('/applications');
    revalidatePath('/tracker');
  }
}
