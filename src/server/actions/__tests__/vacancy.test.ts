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

import { saveVacancyAnalysis } from '@/server/actions/vacancy';
import { revalidatePath } from 'next/cache';

const mockAnalysis = {
  summary: 'Test',
  responsibilities: [],
  mustHaves: [],
  niceToHaves: [],
  atsKeywords: [],
  tone: 'professional',
  companyCulture: 'Startup',
  masterResumeMatchPreview: { relevant: [], gaps: [] },
};

describe('saveVacancyAnalysis', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves analysis to vacancy and revalidates', async () => {
    db.vacancy.findUnique.mockResolvedValue({ id: 'vac-1', userId: 'local-user' });
    db.vacancy.update.mockResolvedValue({});

    await saveVacancyAnalysis('vac-1', mockAnalysis);

    expect(db.vacancy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'vac-1' },
        data: { aiAnalysis: mockAnalysis },
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/applications');
  });

  it('throws when vacancy not found', async () => {
    db.vacancy.findUnique.mockResolvedValue(null);
    await expect(saveVacancyAnalysis('missing', mockAnalysis)).rejects.toThrow('Vacancy not found');
  });

  it('throws when vacancy belongs to different user', async () => {
    db.vacancy.findUnique.mockResolvedValue({ id: 'vac-1', userId: 'other-user' });
    await expect(saveVacancyAnalysis('vac-1', mockAnalysis)).rejects.toThrow();
  });
});
