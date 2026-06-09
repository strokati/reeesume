import { describe, it, expect } from 'vitest';
import { convertDraftToResumeData } from '@/lib/templates/convert-draft';
import { sampleResumeDraftContent } from '@/test/fixtures/resume-draft';

describe('convertDraftToResumeData', () => {
  it('maps work experience with responsibilities as plain strings', () => {
    const result = convertDraftToResumeData(sampleResumeDraftContent);
    expect(result.workExperience[0].responsibilities).toEqual([
      'Built component library used by 12 teams',
      'Led migration from class components to hooks',
    ]);
  });

  it('strips source labels from bullet points', () => {
    const draft = {
      ...sampleResumeDraftContent,
      workExperience: [
        {
          ...sampleResumeDraftContent.workExperience[0],
          responsibilities: [
            { text: 'Built features', source: 'master' as const },
            { text: 'AI suggestion', source: 'ai' as const },
          ],
        },
      ],
    };
    const result = convertDraftToResumeData(draft);
    expect(result.workExperience[0].responsibilities).toEqual(['Built features', 'AI suggestion']);
  });

  it('handles plain string responsibilities', () => {
    const draft = {
      ...sampleResumeDraftContent,
      workExperience: [],
    };
    const result = convertDraftToResumeData(draft);
    expect(result.workExperience).toEqual([]);
  });

  it('handles empty draft content', () => {
    const result = convertDraftToResumeData({
      contactInfo: {},
      workExperience: [],
      education: [],
      skills: [],
      certifications: [],
      awards: [],
      projects: [],
      volunteering: [],
      publications: [],
    });
    expect(result.workExperience).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it('preserves skill categories and levels', () => {
    const result = convertDraftToResumeData(sampleResumeDraftContent);
    expect(result.skills).toHaveLength(3);
    expect(result.skills[0].name).toBe('TypeScript');
    expect(result.skills[0].category).toBe('Languages');
  });

  it('maps education entries correctly', () => {
    const result = convertDraftToResumeData(sampleResumeDraftContent);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe('UC Berkeley');
    expect(result.education[0].degree).toBe('B.S.');
  });

  it('includes contact info at the top level', () => {
    const result = convertDraftToResumeData(sampleResumeDraftContent);
    expect(result.contactInfo.name).toBe('Jane Doe');
    expect(result.contactInfo.email).toBe('jane@example.com');
  });

  it('includes targetTitle and summary', () => {
    const result = convertDraftToResumeData(sampleResumeDraftContent);
    expect(result.targetTitle).toBe('Senior Frontend Engineer');
    expect(result.summary).toBeTruthy();
  });
});
