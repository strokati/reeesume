import { describe, it, expect } from 'vitest';
import { serializeDates, isoDateReviver } from '@/lib/export/serialize';

describe('serializeDates', () => {
  it('converts a Date to an ISO string', () => {
    const d = new Date('2026-07-02T12:00:00.000Z');
    const out = serializeDates(d);
    expect(typeof out).toBe('string');
    expect(out).toBe('2026-07-02T12:00:00.000Z');
  });

  it('walks arrays and converts nested Dates to ISO strings', () => {
    const input = [
      { id: 'a', createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 'b', createdAt: new Date('2026-02-01T00:00:00.000Z') },
    ];
    const out = serializeDates(input);
    expect(typeof out[0].createdAt).toBe('string');
    expect(out[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(typeof out[1].createdAt).toBe('string');
  });

  it('walks nested objects and converts every Date', () => {
    const input = {
      a: new Date('2026-01-01T00:00:00.000Z'),
      nested: { b: new Date('2026-02-01T00:00:00.000Z'), c: 'plain' },
      arr: [new Date('2026-03-01T00:00:00.000Z')],
    };
    const out = serializeDates(input) as Record<string, unknown>;
    expect(out.a).toBe('2026-01-01T00:00:00.000Z');
    expect((out.nested as Record<string, unknown>).b).toBe('2026-02-01T00:00:00.000Z');
    expect((out.arr as unknown[])[0]).toBe('2026-03-01T00:00:00.000Z');
  });

  it('leaves non-Date primitives unchanged', () => {
    const input = { a: 1, b: 'string', c: null, d: undefined, e: true };
    expect(serializeDates(input)).toEqual(input);
  });

  it('produces a JSON-safe object that round-trips through JSON.parse unchanged', () => {
    const original = {
      id: 'x',
      createdAt: new Date('2026-07-02T12:34:56.000Z'),
      nested: { updatedAt: new Date('2026-07-03T00:00:00.000Z') },
    };
    const serialized = serializeDates(original);
    const jsonString = JSON.stringify(serialized);
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    // Strings stay as strings after a plain JSON round-trip — no reviver needed.
    expect(parsed.createdAt).toBe('2026-07-02T12:34:56.000Z');
    expect((parsed.nested as Record<string, unknown>).updatedAt).toBe('2026-07-03T00:00:00.000Z');
  });
});

describe('isoDateReviver', () => {
  it('converts a Z-suffixed ISO timestamp', () => {
    const out = JSON.parse('"2026-07-02T12:00:00.000Z"', isoDateReviver);
    expect(out).toBeInstanceOf(Date);
    expect((out as Date).toISOString()).toBe('2026-07-02T12:00:00.000Z');
  });

  it('converts an offset-suffixed ISO timestamp', () => {
    const out = JSON.parse('"2026-07-02T12:00:00.000+02:00"', isoDateReviver);
    expect(out).toBeInstanceOf(Date);
  });

  it('converts an ISO timestamp with no timezone suffix', () => {
    const out = JSON.parse('"2026-07-02T12:00:00"', isoDateReviver);
    expect(out).toBeInstanceOf(Date);
  });

  it('does NOT convert date-only strings', () => {
    const out = JSON.parse('"2026-07-02"', isoDateReviver);
    expect(out).toBe('2026-07-02');
  });

  it('does NOT convert free text containing an ISO-shaped substring', () => {
    const out = JSON.parse('"I upgraded in 2024-09-01T00:00:00Z"', isoDateReviver);
    expect(out).toBe('I upgraded in 2024-09-01T00:00:00Z');
  });

  it('does not convert ISO-looking numbers', () => {
    const out = JSON.parse('42', isoDateReviver);
    expect(out).toBe(42);
  });

  it('leaves non-ISO strings alone inside a parsed object', () => {
    const parsed = JSON.parse(
      '{"time":"2026-07-02T12:00:00.000Z","note":"remember 2026-07-02"}',
      isoDateReviver
    ) as Record<string, unknown>;
    expect(parsed.time).toBeInstanceOf(Date);
    expect(parsed.note).toBe('remember 2026-07-02');
  });
});
