/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});

import { buildUserArchive } from '@/server/queries/data-export';
import { ARCHIVE_VERSION, UserArchiveSchema } from '@/lib/validations/data-export';

const userRow = {
  id: 'local-user',
  email: 'local@localhost',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const masterResumeRow = {
  id: 'resume-1',
  userId: 'local-user',
  name: 'Default',
  language: 'en',
  isDefault: true,
  contactInfo: null,
  targetTitle: null,
  professionalSummary: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  workCompanies: [],
  educations: [],
  skills: [],
  certifications: [],
  awards: [],
  projects: [],
  volunteeringRoles: [],
  publications: [],
};

const vacancyRow = {
  id: 'vacancy-1',
  userId: 'local-user',
  companyName: 'Acme',
  jobTitle: 'Engineer',
  location: null,
  locationType: null,
  salaryMin: null,
  salaryMax: null,
  currency: 'USD',
  sourceUrl: null,
  rawText: null,
  aiAnalysis: null,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
};

const applicationRow = {
  id: 'app-1',
  vacancyId: 'vacancy-1',
  masterResumeId: null,
  status: 'saved',
  salaryMin: null,
  salaryMax: null,
  proposedSalary: null,
  dateSaved: new Date('2026-02-01T00:00:00.000Z'),
  dateApplied: null,
  interviewDate: null,
  offerDate: null,
  rejectedDate: null,
  excitement: null,
  aiSuggestions: null,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  resumeDrafts: [],
  coverLetterDrafts: [],
  notes: [],
};

const aiConfigRow = {
  id: 'config-1',
  userId: 'local-user',
  providerId: 'openai',
  apiKey: 'ciphertext',
  model: 'gpt-4o',
  isDefault: true,
  baseUrl: null,
  displayName: null,
  apiMode: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function stubDb() {
  db.user.findUniqueOrThrow.mockResolvedValue(userRow);
  db.masterResume.findMany.mockResolvedValue([masterResumeRow]);
  db.vacancy.findMany.mockResolvedValue([vacancyRow]);
  db.application.findMany.mockResolvedValue([applicationRow]);
  db.aiProviderConfig.findMany.mockResolvedValue([aiConfigRow]);
  db.aiCallLog.findMany.mockResolvedValue([]);
  db.aiPromptOverride.findMany.mockResolvedValue([]);
}

describe('buildUserArchive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubDb();
  });

  it('returns an object that round-trips through UserArchiveSchema', async () => {
    const archive = await buildUserArchive('local-user');
    const result = UserArchiveSchema.safeParse(archive);
    expect(result.success).toBe(true);
  });

  it('queries each top-level model exactly once', async () => {
    await buildUserArchive('local-user');
    expect(db.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(db.masterResume.findMany).toHaveBeenCalledTimes(1);
    expect(db.vacancy.findMany).toHaveBeenCalledTimes(1);
    expect(db.application.findMany).toHaveBeenCalledTimes(1);
    expect(db.aiProviderConfig.findMany).toHaveBeenCalledTimes(1);
    expect(db.aiCallLog.findMany).toHaveBeenCalledTimes(1);
    expect(db.aiPromptOverride.findMany).toHaveBeenCalledTimes(1);
  });

  it('binds every query to the requested userId', async () => {
    await buildUserArchive('local-user');
    expect(db.masterResume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local-user' } })
    );
    expect(db.vacancy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local-user' } })
    );
    expect(db.aiProviderConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local-user' } })
    );
    expect(db.aiCallLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local-user' } })
    );
    expect(db.aiPromptOverride.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local-user' } })
    );
  });

  it('queries applications via vacancy.userId (not direct userId)', async () => {
    await buildUserArchive('local-user');
    expect(db.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { vacancy: { userId: 'local-user' } } })
    );
  });

  it('sets archive.version to ARCHIVE_VERSION', async () => {
    const archive = await buildUserArchive('local-user');
    expect(archive.version).toBe(ARCHIVE_VERSION);
  });

  it('sets archive.userId to the requested userId', async () => {
    const archive = await buildUserArchive('local-user');
    expect(archive.userId).toBe('local-user');
  });

  it('sets archive.appVersion to a non-empty string', async () => {
    const archive = await buildUserArchive('local-user');
    expect(typeof archive.appVersion).toBe('string');
    expect(archive.appVersion.length).toBeGreaterThan(0);
  });

  it('sets archive.createdAt to a valid ISO string', async () => {
    const archive = await buildUserArchive('local-user');
    expect(typeof archive.createdAt).toBe('string');
    const parsed = new Date(archive.createdAt);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });

  it('converts Date instances to ISO strings in the output', async () => {
    const archive = await buildUserArchive('local-user');
    expect(typeof (archive.user as any).createdAt).toBe('string');
    expect((archive.user as any).createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(typeof (archive.masterResumes[0] as any).createdAt).toBe('string');
    expect(typeof (archive.vacancies[0] as any).createdAt).toBe('string');
    expect(typeof (archive.applications[0] as any).dateSaved).toBe('string');
  });

  it('returns empty arrays when the user has no data', async () => {
    db.masterResume.findMany.mockResolvedValue([]);
    db.vacancy.findMany.mockResolvedValue([]);
    db.application.findMany.mockResolvedValue([]);
    db.aiProviderConfig.findMany.mockResolvedValue([]);
    db.aiCallLog.findMany.mockResolvedValue([]);
    db.aiPromptOverride.findMany.mockResolvedValue([]);

    const archive = await buildUserArchive('empty-user');
    expect(archive.masterResumes).toEqual([]);
    expect(archive.vacancies).toEqual([]);
    expect(archive.applications).toEqual([]);
    expect(archive.aiProviderConfigs).toEqual([]);
    expect(archive.aiCallLogs).toEqual([]);
    expect(archive.aiPromptOverrides).toEqual([]);
  });
});
