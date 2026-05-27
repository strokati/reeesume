'use client';

import { useState, useCallback } from 'react';

export function useRephrase() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rephrase = useCallback(
    async (original: string, direction: string, context: string, providerId: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const res = await fetch('/api/ai/rephrase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ original, direction, context, providerId }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Rephrase failed');
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

        setResult(fullText.trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Rephrase failed');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { rephrase, result, isLoading, error };
}
