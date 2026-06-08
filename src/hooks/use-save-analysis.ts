'use client';

import { useState, useCallback } from 'react';
import { saveVacancyAnalysis } from '@/server/actions/vacancy';
import type { VacancyAnalysis } from '@/types/vacancy-analysis';

export function useSaveAnalysis(vacancyId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (analysis: VacancyAnalysis) => {
      setIsSaving(true);
      setError(null);
      try {
        await saveVacancyAnalysis(vacancyId, analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save analysis');
      } finally {
        setIsSaving(false);
      }
    },
    [vacancyId]
  );

  return { save, isSaving, error };
}
