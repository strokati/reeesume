import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatDate } from '@/lib/utils';

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-11T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for < 1 minute ago', () => {
    expect(formatRelativeTime(new Date(now - 30_000))).toBe('Just now');
  });

  it('returns minutes for < 1 hour', () => {
    expect(formatRelativeTime(new Date(now - 5 * 60_000))).toBe('5m ago');
  });

  it('returns hours for < 24 hours', () => {
    expect(formatRelativeTime(new Date(now - 2 * 3_600_000))).toBe('2h ago');
  });

  it('returns days for < 7 days', () => {
    expect(formatRelativeTime(new Date(now - 3 * 86_400_000))).toBe('3d ago');
  });

  it('returns weeks for < 4 weeks', () => {
    expect(formatRelativeTime(new Date(now - 7 * 86_400_000))).toBe('1w ago');
  });

  it('falls back to formatDate for older dates', () => {
    const oldDate = new Date('2025-01-15');
    expect(formatRelativeTime(oldDate)).toBe(formatDate(oldDate));
  });

  it('handles string dates', () => {
    const fiveMinsAgo = new Date(now - 5 * 60_000).toISOString();
    expect(formatRelativeTime(fiveMinsAgo)).toBe('5m ago');
  });

  it('handles Date objects', () => {
    const twoHoursAgo = new Date(now - 2 * 3_600_000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });
});
