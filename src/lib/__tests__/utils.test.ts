import { describe, it, expect } from 'vitest';
import { cn, formatDate } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active');
  });

  it('deduplicates Tailwind classes — last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles undefined and null gracefully', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-03-15'));
    expect(result).toBe('Mar 2024');
  });

  it('formats an ISO string', () => {
    const result = formatDate('2024-01-01');
    expect(result).toBe('Jan 2024');
  });

  it('returns "Present" for null', () => {
    expect(formatDate(null)).toBe('Present');
  });

  it('returns "Present" for undefined', () => {
    expect(formatDate(undefined)).toBe('Present');
  });
});
