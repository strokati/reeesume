export const COMMON_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'UAH',
  'PLN',
  'CAD',
  'AUD',
  'CHF',
  'CZK',
  'INR',
] as const;

export function formatSalary(amount: number, currency: string | null | undefined): string {
  const code = (currency ?? '').toUpperCase();
  if (!code) return amount.toLocaleString('en-US');
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('en-US')} ${code}`;
  }
}

export function formatSalaryCompact(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (min == null && max == null) return null;
  const symbol = currencySymbol(currency);
  if (min != null && max != null) {
    return `${symbol}${(min / 1000).toFixed(0)}k–${symbol}${(max / 1000).toFixed(0)}k`;
  }
  if (min != null) return `${symbol}${(min / 1000).toFixed(0)}k+`;
  return `Up to ${symbol}${(max! / 1000).toFixed(0)}k`;
}

export function currencySymbol(currency: string | null | undefined): string {
  const code = (currency ?? '').toUpperCase();
  if (!code) return '';
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart?.value ?? '';
  } catch {
    return `${code} `;
  }
}
