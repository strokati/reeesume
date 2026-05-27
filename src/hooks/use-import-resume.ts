'use client';

import { useState, useCallback } from 'react';
import type { ImportedResumeData } from '@/lib/ai/prompts/import-resume';

type ProgressSection = {
  name: string;
  done: boolean;
};

const SECTION_NAMES = [
  'Contact Info',
  'Target Title',
  'Professional Summary',
  'Work Experience',
  'Education',
  'Skills',
  'Certifications',
  'Awards',
  'Projects',
  'Volunteering',
  'Publications',
];

function inferProgress(partial: Record<string, unknown>): ProgressSection[] {
  return SECTION_NAMES.map((name) => {
    const key =
      name === 'Work Experience'
        ? 'workCompanies'
        : name === 'Volunteering'
          ? 'volunteeringRoles'
          : name.replace(/\s/g, '').replace(/^./, (c) => c.toLowerCase());

    let done = false;
    if (key === 'contactInfo')
      done = !!partial.contactInfo && Object.values(partial.contactInfo as object).some(Boolean);
    else if (key === 'targetTitle') done = !!partial.targetTitle;
    else if (key === 'professionalSummary') done = !!partial.professionalSummary;
    else done = Array.isArray(partial[key]) && (partial[key] as unknown[]).length > 0;

    return { name, done };
  });
}

export function useImportResume() {
  const [result, setResult] = useState<ImportedResumeData | null>(null);
  const [partialResult, setPartialResult] = useState<ImportedResumeData | null>(null);
  const [progress, setProgress] = useState<ProgressSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, providerId: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setPartialResult(null);
    setProgress(SECTION_NAMES.map((name) => ({ name, done: false })));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('providerId', providerId);

      const res = await fetch('/api/ai/import-resume', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Import failed');
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastParsed: ImportedResumeData | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Each line is a complete JSON snapshot of the partial object
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete last line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed) as ImportedResumeData;
            lastParsed = data;
            setPartialResult(data);
            setProgress(inferProgress(data as Record<string, unknown>));
          } catch {
            // Malformed line — skip
          }
        }
      }

      if (lastParsed) {
        setResult(lastParsed);
        setPartialResult(lastParsed);
        setProgress(inferProgress(lastParsed as Record<string, unknown>));
      } else {
        throw new Error('Could not parse import response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { upload, result, partialResult, isLoading, progress, error };
}
