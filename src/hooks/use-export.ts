'use client';

import { useState, useCallback } from 'react';

async function downloadBlob(res: Response, fallbackName: string) {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="(.+)"/);
  a.download = match?.[1] ?? fallbackName;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportResume = useCallback(
    async (resumeDraftId: string, format: 'pdf' | 'docx', includeCoverLetter?: boolean) => {
      setIsExporting(true);
      try {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeDraftId, format, includeCoverLetter }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Export failed');
        }

        await downloadBlob(res, `resume.${format === 'pdf' ? 'pdf' : 'docx'}`);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportCoverLetter = useCallback(async (coverLetterDraftId: string) => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetterDraftId, format: 'pdf' }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Export failed');
      }

      await downloadBlob(res, 'cover-letter.pdf');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportResume, exportCoverLetter, isExporting };
}
