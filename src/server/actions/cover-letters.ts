'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  return session?.user?.id ?? 'local-user';
}

export async function createCoverLetterDraft(applicationId: string, name: string): Promise<string> {
  await requireAuth();

  const count = await db.coverLetterDraft.count({ where: { applicationId } });
  const draft = await db.coverLetterDraft.create({
    data: {
      applicationId,
      name: name || `Draft ${count + 1}`,
      tone: 'professional',
    },
  });

  revalidatePath(`/applications/${applicationId}/cover-letter`);
  return draft.id;
}

export async function updateCoverLetterContent(id: string, content: string): Promise<void> {
  await requireAuth();
  try {
    await db.coverLetterDraft.update({ where: { id }, data: { content } });
  } catch {
    throw new Error('Failed to update cover letter.');
  }
}

export async function updateCoverLetterTone(id: string, tone: string): Promise<void> {
  await requireAuth();
  if (!['professional', 'confident', 'warm'].includes(tone)) {
    throw new Error('Invalid tone.');
  }
  try {
    await db.coverLetterDraft.update({ where: { id }, data: { tone } });
  } catch {
    throw new Error('Failed to update tone.');
  }
}

export async function updateHiringManager(id: string, hiringManager: string): Promise<void> {
  await requireAuth();
  try {
    await db.coverLetterDraft.update({ where: { id }, data: { hiringManager } });
  } catch {
    throw new Error('Failed to update hiring manager.');
  }
}

export async function renameCoverLetterDraft(id: string, name: string): Promise<void> {
  await requireAuth();
  try {
    await db.coverLetterDraft.update({ where: { id }, data: { name } });
  } catch {
    throw new Error('Failed to rename draft.');
  }
}

export async function deleteCoverLetterDraft(id: string): Promise<void> {
  await requireAuth();
  const draft = await db.coverLetterDraft.findUnique({ where: { id } });
  if (!draft) throw new Error('Draft not found.');

  await db.coverLetterDraft.delete({ where: { id } });

  if (draft.isActive) {
    const latest = await db.coverLetterDraft.findFirst({
      where: { applicationId: draft.applicationId, id: { not: id } },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      await db.coverLetterDraft.update({ where: { id: latest.id }, data: { isActive: true } });
    }
  }

  revalidatePath(`/applications/${draft.applicationId}/cover-letter`);
}

export async function setActiveCoverLetterDraft(id: string, applicationId: string): Promise<void> {
  await requireAuth();
  await db.$transaction([
    db.coverLetterDraft.updateMany({
      where: { applicationId },
      data: { isActive: false },
    }),
    db.coverLetterDraft.update({
      where: { id },
      data: { isActive: true },
    }),
  ]);
  revalidatePath(`/applications/${applicationId}/cover-letter`);
}

export async function markCoverLetterReady(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.coverLetterDraft.update({
      where: { id },
      data: { status: 'ready' },
    });
  } catch {
    throw new Error('Failed to mark as ready.');
  }
  revalidatePath(`/applications`);
}

export async function revertCoverLetterToDraft(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.coverLetterDraft.update({
      where: { id },
      data: { status: 'draft' },
    });
  } catch {
    throw new Error('Failed to revert.');
  }
  revalidatePath(`/applications`);
}

export async function duplicateCoverLetterDraft(id: string): Promise<string> {
  await requireAuth();
  const draft = await db.coverLetterDraft.findUnique({ where: { id } });
  if (!draft) throw new Error('Draft not found.');

  const copy = await db.coverLetterDraft.create({
    data: {
      applicationId: draft.applicationId,
      name: `Copy of ${draft.name}`,
      content: draft.content,
      tone: draft.tone,
      hiringManager: draft.hiringManager,
      isActive: false,
      status: 'draft',
    },
  });

  revalidatePath(`/applications/${draft.applicationId}/cover-letter`);
  return copy.id;
}

export async function listCoverLetterDrafts(applicationId: string) {
  await requireAuth();
  return db.coverLetterDraft.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });
}
