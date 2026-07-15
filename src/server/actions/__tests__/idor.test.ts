/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'user-a' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  }),
}));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { updateWorkCompany } from '@/server/actions/master-resume';
import { updateApplicationStatus, deleteApplicationNote } from '@/server/actions/applications';
import { renameResumeDraft } from '@/server/actions/resume-drafts';
import { renameCoverLetterDraft } from '@/server/actions/cover-letters';

// Every mutation in the server-action layer must reject when the
// underlying resource's ownership chain does not reach the calling user.
// `db.X.findFirst` returning null is the simulated "row exists but belongs
// to someone else" case (the helper queries with `where: { ..., userId }`).

describe('IDOR guards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updateWorkCompany rejects when company belongs to another user', async () => {
    db.workCompany.findFirst.mockResolvedValue(null);
    await expect(updateWorkCompany('co-1', { name: 'Evil' } as any)).rejects.toThrow('Not found.');
    expect(db.workCompany.update).not.toHaveBeenCalled();
  });

  it('updateApplicationStatus rejects when application belongs to another user', async () => {
    db.application.findFirst.mockResolvedValue(null);
    await expect(updateApplicationStatus('app-1', { status: 'interview' })).rejects.toThrow(
      'Not found.'
    );
    expect(db.application.update).not.toHaveBeenCalled();
  });

  it('deleteApplicationNote rejects when note belongs to another user', async () => {
    db.applicationNote.findFirst.mockResolvedValue(null);
    await expect(deleteApplicationNote('note-1')).rejects.toThrow('Not found.');
    expect(db.applicationNote.delete).not.toHaveBeenCalled();
  });

  it('renameResumeDraft rejects when draft belongs to another user', async () => {
    db.resumeDraft.findFirst.mockResolvedValue(null);
    await expect(renameResumeDraft('draft-1', 'stolen')).rejects.toThrow('Not found.');
    expect(db.resumeDraft.update).not.toHaveBeenCalled();
  });

  it('renameCoverLetterDraft rejects when draft belongs to another user', async () => {
    db.coverLetterDraft.findFirst.mockResolvedValue(null);
    await expect(renameCoverLetterDraft('cl-1', 'stolen')).rejects.toThrow('Not found.');
    expect(db.coverLetterDraft.update).not.toHaveBeenCalled();
  });

  it('updateWorkCompany succeeds when findFirst returns the row (owned)', async () => {
    db.workCompany.findFirst.mockResolvedValue({ id: 'co-1' });
    db.workCompany.update.mockResolvedValue({});
    await expect(updateWorkCompany('co-1', { name: 'Mine' } as any)).resolves.toBeUndefined();
    expect(db.workCompany.update).toHaveBeenCalled();
  });
});
