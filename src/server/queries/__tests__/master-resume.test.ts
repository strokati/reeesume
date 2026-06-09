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
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import {
  getMasterResumes,
  getMasterResumeById,
  getOrCreateDefaultMasterResume,
  resolveResumeId,
  getWorkExperience,
} from '@/server/queries/master-resume';

describe('getMasterResumes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns resumes for the given userId', async () => {
    db.masterResume.findMany.mockResolvedValue([
      { id: 'r1', name: 'Main Resume', isDefault: true },
    ]);
    const result = await getMasterResumes('user-1');
    expect(result).toHaveLength(1);
    expect(db.masterResume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
  });

  it('returns empty array when user has no resumes', async () => {
    db.masterResume.findMany.mockResolvedValue([]);
    const result = await getMasterResumes('user-1');
    expect(result).toEqual([]);
  });
});

describe('getMasterResumeById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns resume when found and belongs to user', async () => {
    db.masterResume.findFirst.mockResolvedValue({ id: 'r1', userId: 'user-1' });
    const result = await getMasterResumeById('user-1', 'r1');
    expect(result).not.toBeNull();
  });

  it('returns null when not found', async () => {
    db.masterResume.findFirst.mockResolvedValue(null);
    const result = await getMasterResumeById('user-1', 'wrong-id');
    expect(result).toBeNull();
  });
});

describe('getOrCreateDefaultMasterResume', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns existing default resume', async () => {
    db.user.upsert.mockResolvedValue({});
    db.masterResume.findFirst.mockResolvedValue({ id: 'r1', isDefault: true });
    const result = await getOrCreateDefaultMasterResume('user-1');
    expect(result.id).toBe('r1');
    expect(db.masterResume.create).not.toHaveBeenCalled();
  });

  it('creates a new resume when none exists', async () => {
    db.user.upsert.mockResolvedValue({});
    db.masterResume.findFirst.mockResolvedValue(null);
    db.masterResume.create.mockResolvedValue({ id: 'r2', isDefault: true });
    const result = await getOrCreateDefaultMasterResume('user-1');
    expect(db.masterResume.create).toHaveBeenCalled();
    expect(result.id).toBe('r2');
  });
});

describe('resolveResumeId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the resume object when found by id', async () => {
    db.masterResume.findFirst.mockResolvedValue({ id: 'r1', isDefault: false });
    const result = await resolveResumeId('user-1', 'r1');
    expect(result.id).toBe('r1');
  });

  it('falls back to default resume when resumeId is null', async () => {
    db.masterResume.findFirst.mockResolvedValue(null);
    db.user.upsert.mockResolvedValue({});
    db.masterResume.findFirst
      .mockResolvedValueOnce(null) // first call: findFirst with masterResumeId
      .mockResolvedValueOnce({ id: 'default-r', isDefault: true }); // second call inside getOrCreateDefault
    const result = await resolveResumeId('user-1', null);
    expect(result.id).toBe('default-r');
  });
});

describe('getWorkExperience', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns companies with roles', async () => {
    db.workCompany.findMany.mockResolvedValue([{ id: 'c1', name: 'Acme', roles: [] }]);
    const result = await getWorkExperience('r1');
    expect(result).toHaveLength(1);
    expect(db.workCompany.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { resumeId: 'r1' } })
    );
  });

  it('returns empty array when no work experience', async () => {
    db.workCompany.findMany.mockResolvedValue([]);
    const result = await getWorkExperience('r1');
    expect(result).toEqual([]);
  });
});
