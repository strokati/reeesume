import { describe, it, expect } from 'vitest';
import { UserArchiveSchema, ARCHIVE_VERSION } from '@/lib/validations/data-export';
import { sampleArchive } from '@/test/fixtures/data-export';

describe('UserArchiveSchema', () => {
  it('accepts a complete, well-formed archive', () => {
    const result = UserArchiveSchema.safeParse(sampleArchive);
    expect(result.success).toBe(true);
  });

  it('reports a missing version field', () => {
    const { version: _v, ...rest } = sampleArchive;
    void _v;
    const result = UserArchiveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects an unsupported version', () => {
    const result = UserArchiveSchema.safeParse({ ...sampleArchive, version: 99 });
    expect(result.success).toBe(false);
  });

  it('rejects a missing top-level key (user)', () => {
    const { user: _u, ...rest } = sampleArchive;
    void _u;
    const result = UserArchiveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a missing top-level key (applications)', () => {
    const { applications: _a, ...rest } = sampleArchive;
    void _a;
    const result = UserArchiveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('accepts archives with empty arrays (fresh-user case)', () => {
    const fresh = {
      ...sampleArchive,
      masterResumes: [],
      vacancies: [],
      applications: [],
      aiProviderConfigs: [],
      aiCallLogs: [],
      aiPromptOverrides: [],
    };
    const result = UserArchiveSchema.safeParse(fresh);
    expect(result.success).toBe(true);
  });

  it('accepts archives with extra unknown leaf fields (forward-compat passthrough)', () => {
    const withExtras = {
      ...sampleArchive,
      masterResumes: sampleArchive.masterResumes.map((mr) => ({
        ...mr,
        futureField: 'unknown',
        anotherFutureField: 42,
      })),
    };
    const result = UserArchiveSchema.safeParse(withExtras);
    expect(result.success).toBe(true);
  });

  it('rejects a non-string appVersion', () => {
    const result = UserArchiveSchema.safeParse({ ...sampleArchive, appVersion: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-ISO createdAt', () => {
    const result = UserArchiveSchema.safeParse({ ...sampleArchive, createdAt: 'yesterday' });
    expect(result.success).toBe(false);
  });

  it('exposes ARCHIVE_VERSION as a constant matching the schema', () => {
    expect(ARCHIVE_VERSION).toBe(1);
    const result = UserArchiveSchema.safeParse(sampleArchive);
    if (result.success) {
      expect(result.data.version).toBe(ARCHIVE_VERSION);
    }
  });
});
