'use client';

import { useState, useCallback } from 'react';

export interface CoverLetterResult {
  hiringManager?: string;
  opening: string;
  body: string[];
  closing: string;
  tone: string;
}

export function useCoverLetterGeneration(applicationId: string) {
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (tone: string, providerId: string, draftId?: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setRawText(null);

      try {
        const res = await fetch('/api/ai/cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId, tone, providerId, draftId }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Cover letter generation failed');
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

        setRawText(fullText);

        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setResult(JSON.parse(jsonMatch[0]));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      } finally {
        setIsLoading(false);
      }
    },
    [applicationId]
  );

  return { generate, result, rawText, isLoading, error };
}
