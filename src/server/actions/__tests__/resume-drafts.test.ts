/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'local-user' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/server/queries/master-resume', () => ({
  getFullMasterResume: vi.fn().mockResolvedValue({
    contactInfo: { name: 'Test', email: 't@t.com' },
    targetTitle: 'Engineer',
    professionalSummary: 'Summary',
    workCompanies: [],
    educations: [],
    skills: [],
    certifications: [],
    awards: [],
    projects: [],
    volunteeringRoles: [],
    publications: [],
  }),
}));

import { createResumeDraft, setActiveDraft } from '@/server/actions/resume-drafts';
import { revalidatePath } from 'next/cache';

describe('createResumeDraft', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a draft and returns its id', async () => {
    db.application.findUnique.mockResolvedValue({
      id: 'app-1',
      masterResumeId: 'resume-1',
    });
    db.resumeDraft.count.mockResolvedValue(0);
    db.resumeDraft.create.mockResolvedValue({ id: 'draft-1' });

    const id = await createResumeDraft('app-1', 'Draft 1');
    expect(id).toBe('draft-1');
    expect(revalidatePath).toHaveBeenCalledWith('/applications/app-1/resume');
  });
});

describe('setActiveDraft', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deactivates all other drafts then activates target', async () => {
    db.$transaction.mockImplementation(async (fn: any) => {
      if (typeof fn === 'function') return fn(db);
      return Promise.all(fn);
    });
    db.resumeDraft.updateMany.mockResolvedValue({ count: 2 });
    db.resumeDraft.update.mockResolvedValue({ id: 'draft-1', isActive: true });

    await setActiveDraft('draft-1', 'app-1');

    expect(db.resumeDraft.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { applicationId: 'app-1' },
        data: { isActive: false },
      })
    );
    expect(db.resumeDraft.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'draft-1' },
        data: { isActive: true },
      })
    );
  });

  it('revalidates after activation', async () => {
    db.$transaction.mockImplementation(async (fn: any) => {
      if (typeof fn === 'function') return fn(db);
      return Promise.all(fn);
    });
    db.resumeDraft.updateMany.mockResolvedValue({ count: 0 });
    db.resumeDraft.update.mockResolvedValue({ id: 'draft-1' });

    await setActiveDraft('draft-1', 'app-1');
    expect(revalidatePath).toHaveBeenCalledWith('/applications/app-1/resume');
  });
});
