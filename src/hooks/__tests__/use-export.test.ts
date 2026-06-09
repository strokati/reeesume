/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '@/hooks/use-export';

global.fetch = vi.fn();

describe('useExport', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts with isExporting = false', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.isExporting).toBe(false);
  });

  it('calls /api/export with correct params', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Disposition': 'filename="resume.pdf"' }),
      blob: () => Promise.resolve(new Blob()),
    });

    const { result } = renderHook(() => useExport());
    await act(async () => {
      try {
        await result.current.exportResume('draft-1', 'pdf');
      } catch {
        // downloadBlob may fail in jsdom, that's ok
      }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/export',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          resumeDraftId: 'draft-1',
          format: 'pdf',
          includeCoverLetter: undefined,
        }),
      })
    );
  });

  it('handles fetch error — isExporting returns to false', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useExport());
    await act(async () => {
      await result.current.exportResume('draft-1', 'pdf').catch(() => {});
    });

    expect(result.current.isExporting).toBe(false);
  });
});
