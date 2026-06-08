/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/server/actions/vacancy', () => ({
  saveVacancyAnalysis: vi.fn(),
}));

import { useSaveAnalysis } from '@/hooks/use-save-analysis';
import { saveVacancyAnalysis } from '@/server/actions/vacancy';

describe('useSaveAnalysis', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with isSaving=false and no error', () => {
    const { result } = renderHook(() => useSaveAnalysis('vac-1'));
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls saveVacancyAnalysis with vacancyId and analysis', async () => {
    const analysis = { summary: 'Test' } as any;
    vi.mocked(saveVacancyAnalysis).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveAnalysis('vac-1'));
    await act(async () => {
      await result.current.save(analysis);
    });

    expect(saveVacancyAnalysis).toHaveBeenCalledWith('vac-1', analysis);
    expect(result.current.isSaving).toBe(false);
  });

  it('sets error when server action fails', async () => {
    vi.mocked(saveVacancyAnalysis).mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useSaveAnalysis('vac-1'));
    await act(async () => {
      await result.current.save({} as any);
    });

    expect(result.current.error).toBe('DB error');
  });
});
