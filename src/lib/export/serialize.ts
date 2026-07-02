/**
 * Recursively convert every Date instance in `value` to an ISO string so the
 * object is JSON-safe (no Date instances hiding inside). Prisma returns Date
 * objects for DateTime columns; this makes the output inspectable and
 * round-trippable without relying on JSON.stringify's implicit Date toJSON.
 */
export function serializeDates<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(serializeDates) as unknown as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeDates(v)])
    ) as unknown as T;
  }
  return value;
}

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

/**
 * JSON.parse reviver that converts ISO-8601 timestamp strings back to Date.
 *
 * Anchored on the full `YYYY-MM-DDTHH:MM:SS` prefix — won't match date-only
 * strings ("2026-07-02") or free text that happens to contain an ISO-shaped
 * substring.
 */
export function isoDateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_PREFIX.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return value;
}
