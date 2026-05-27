'use client';

import { useState, useCallback } from 'react';
import type { AtsCheckResult } from '@/lib/ai/prompts/ats-check';

export function useAtsCheck(resumeDraftId: string) {
  const [result, setResult] = useState<AtsCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(
    async (providerId: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch('/api/ai/ats-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeDraftId, providerId }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'ATS check failed');
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
          setResult(JSON.parse(jsonMatch[0]));
        } else {
          throw new Error('Could not parse ATS check response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ATS check failed');
      } finally {
        setIsLoading(false);
      }
    },
    [resumeDraftId]
  );

  return { runCheck, result, isLoading, error };
}
