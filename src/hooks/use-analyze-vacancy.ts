'use client';

import { useState, useCallback } from 'react';
import type { VacancyAnalysis } from '@/types/vacancy-analysis';

export type { VacancyAnalysis };

export function useAnalyzeVacancy(applicationId: string) {
  const [analysis, setAnalysis] = useState<VacancyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (providerId: string) => {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        const res = await fetch('/api/ai/analyze-vacancy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, providerId }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Analysis failed');
        }

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAnalysis(parsed);
        } else {
          throw new Error('Could not parse analysis response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    },
    [applicationId]
  );

  return { analyze, analysis, isLoading, error };
}
