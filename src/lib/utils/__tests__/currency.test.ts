import { describe, it, expect } from 'vitest';
import {
  formatSalary,
  formatSalaryCompact,
  currencySymbol,
  COMMON_CURRENCIES,
} from '@/lib/utils/currency';

describe('formatSalary', () => {
  it('formats USD with $ symbol and grouping', () => {
    expect(formatSalary(75000, 'USD')).toBe('$75,000');
  });

  it('formats EUR with € symbol', () => {
    expect(formatSalary(75000, 'EUR')).toBe('€75,000');
  });

  it('formats GBP with £ symbol', () => {
    expect(formatSalary(75000, 'GBP')).toBe('£75,000');
  });

  it('formats JPY without decimals', () => {
    expect(formatSalary(75000, 'JPY')).toBe('¥75,000');
  });

  it('returns bare grouped number when currency is null', () => {
    expect(formatSalary(75000, null)).toBe('75,000');
  });

  it('returns bare grouped number when currency is undefined', () => {
    expect(formatSalary(75000, undefined)).toBe('75,000');
  });

  it('falls back to "<amount> <code>" for unknown ISO codes', () => {
    // 'INVALID' is rejected by Intl.NumberFormat; our helper catches and falls back.
    // Note: 'XYZ' and 'AAA' are technically valid ISO 4217 reservation codes and do NOT throw.
    expect(formatSalary(75000, 'INVALID')).toBe('75,000 INVALID');
  });

  it('handles lowercase currency codes', () => {
    expect(formatSalary(75000, 'eur')).toBe('€75,000');
  });
});

describe('formatSalaryCompact', () => {
  it('formats EUR range compactly', () => {
    expect(formatSalaryCompact(50000, 70000, 'EUR')).toBe('€50k–€70k');
  });

  it('formats USD range compactly', () => {
    expect(formatSalaryCompact(50000, 70000, 'USD')).toBe('$50k–$70k');
  });

  it('formats min-only with "+" suffix', () => {
    expect(formatSalaryCompact(50000, null, 'USD')).toBe('$50k+');
  });

  it('formats max-only with "Up to" prefix', () => {
    expect(formatSalaryCompact(null, 70000, 'USD')).toBe('Up to $70k');
  });

  it('returns null when both bounds are null', () => {
    expect(formatSalaryCompact(null, null, 'USD')).toBeNull();
  });

  it('returns null when both bounds are undefined', () => {
    expect(formatSalaryCompact(undefined, undefined, 'USD')).toBeNull();
  });

  it('uses bare k-suffix when currency is null', () => {
    expect(formatSalaryCompact(50000, 70000, null)).toBe('50k–70k');
  });
});

describe('currencySymbol', () => {
  it('returns $ for USD', () => {
    expect(currencySymbol('USD')).toBe('$');
  });

  it('returns € for EUR', () => {
    expect(currencySymbol('EUR')).toBe('€');
  });

  it('returns empty string for null', () => {
    expect(currencySymbol(null)).toBe('');
  });

  it('appends code with trailing space for codes Intl rejects', () => {
    expect(currencySymbol('INVALID')).toBe('INVALID ');
  });
});

describe('COMMON_CURRENCIES', () => {
  it('includes the most-used trading currencies', () => {
    expect(COMMON_CURRENCIES).toContain('USD');
    expect(COMMON_CURRENCIES).toContain('EUR');
    expect(COMMON_CURRENCIES).toContain('GBP');
    expect(COMMON_CURRENCIES).toContain('UAH');
    expect(COMMON_CURRENCIES).toContain('PLN');
  });
});
