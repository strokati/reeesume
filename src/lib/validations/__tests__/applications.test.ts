import { describe, it, expect } from 'vitest';
import {
  CreateApplicationSchema,
  UpdateApplicationStatusSchema,
  UpdateExcitementSchema,
  UpdateTrackingSchema,
} from '@/lib/validations/applications';

describe('CreateApplicationSchema', () => {
  it('accepts valid application with required fields', () => {
    const result = CreateApplicationSchema.safeParse({
      companyName: 'Acme Corp',
      jobTitle: 'Engineer',
      masterResumeId: 'resume-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts application with all optional fields', () => {
    const result = CreateApplicationSchema.safeParse({
      companyName: 'Acme Corp',
      jobTitle: 'Engineer',
      masterResumeId: 'resume-1',
      location: 'SF',
      locationType: 'Hybrid',
      salaryMin: '100000',
      salaryMax: '150000',
      currency: 'USD',
      sourceUrl: 'https://example.com/job',
      rawText: 'Job posting text',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing companyName', () => {
    const result = CreateApplicationSchema.safeParse({
      jobTitle: 'Engineer',
      masterResumeId: 'resume-1',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('companyName');
  });

  it('rejects missing jobTitle', () => {
    const result = CreateApplicationSchema.safeParse({
      companyName: 'Acme',
      masterResumeId: 'resume-1',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('jobTitle');
  });

  it('rejects missing masterResumeId', () => {
    const result = CreateApplicationSchema.safeParse({
      companyName: 'Acme',
      jobTitle: 'Engineer',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid locationType', () => {
    const result = CreateApplicationSchema.safeParse({
      companyName: 'Acme',
      jobTitle: 'Engineer',
      masterResumeId: 'r1',
      locationType: 'Space',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid locationType values', () => {
    for (const lt of ['On-site', 'Hybrid', 'Remote']) {
      const result = CreateApplicationSchema.safeParse({
        companyName: 'Acme',
        jobTitle: 'Engineer',
        masterResumeId: 'r1',
        locationType: lt,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('UpdateApplicationStatusSchema', () => {
  it('accepts all valid status values', () => {
    const statuses = [
      'saved',
      'planned',
      'applied',
      'screening',
      'interview',
      'offer',
      'rejected',
      'on_hold',
    ];
    for (const status of statuses) {
      const result = UpdateApplicationStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects unknown status string', () => {
    const result = UpdateApplicationStatusSchema.safeParse({ status: 'unknown' });
    expect(result.success).toBe(false);
  });
});

describe('UpdateExcitementSchema', () => {
  it('accepts values 1 through 5', () => {
    for (const v of [1, 2, 3, 4, 5]) {
      const result = UpdateExcitementSchema.safeParse({ excitement: v });
      expect(result.success).toBe(true);
    }
  });

  it('rejects 0', () => {
    const result = UpdateExcitementSchema.safeParse({ excitement: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects 6', () => {
    const result = UpdateExcitementSchema.safeParse({ excitement: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer', () => {
    const result = UpdateExcitementSchema.safeParse({ excitement: 3.5 });
    expect(result.success).toBe(false);
  });
});

describe('UpdateTrackingSchema', () => {
  it('accepts partial tracking data', () => {
    const result = UpdateTrackingSchema.safeParse({
      dateApplied: '2024-01-15',
      excitement: 4,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null salary values', () => {
    const result = UpdateTrackingSchema.safeParse({
      salaryMin: null,
      salaryMax: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts positive salary integers', () => {
    const result = UpdateTrackingSchema.safeParse({
      salaryMin: 100000,
      salaryMax: 150000,
    });
    expect(result.success).toBe(true);
  });
});
