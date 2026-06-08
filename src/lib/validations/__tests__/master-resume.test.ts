import { describe, it, expect } from 'vitest';
import {
  ContactInfoSchema,
  CreateWorkCompanySchema,
  UpdateWorkCompanySchema,
  CreateWorkRoleSchema,
  UpdateWorkRoleSchema,
  CreateWorkProjectSchema,
  CreateEducationSchema,
  UpdateEducationSchema,
  CreateSkillSchema,
  UpdateSkillSchema,
  CreateCertificationSchema,
  CreateAwardSchema,
  CreateProjectSchema,
  CreateVolunteeringRoleSchema,
  CreatePublicationSchema,
  ReorderSchema,
  CreateMasterResumeSchema,
  RenameMasterResumeSchema,
  SetLanguageSchema,
} from '@/lib/validations/master-resume';

describe('ContactInfoSchema', () => {
  it('accepts valid contact info', () => {
    const result = ContactInfoSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object — all fields optional', () => {
    const result = ContactInfoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('CreateWorkCompanySchema', () => {
  it('accepts company with name only', () => {
    const result = CreateWorkCompanySchema.safeParse({ name: 'Acme Corp' });
    expect(result.success).toBe(true);
  });

  it('accepts company with all fields', () => {
    const result = CreateWorkCompanySchema.safeParse({
      name: 'Acme Corp',
      location: 'SF',
      employmentType: 'Full-time',
      startDate: '2020-01',
      endDate: '2024-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateWorkCompanySchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('name');
  });

  it('rejects empty string name', () => {
    const result = CreateWorkCompanySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid employmentType', () => {
    const result = CreateWorkCompanySchema.safeParse({
      name: 'Co',
      employmentType: 'Invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateWorkCompanySchema', () => {
  it('accepts partial data', () => {
    const result = UpdateWorkCompanySchema.safeParse({ location: 'NYC' });
    expect(result.success).toBe(true);
  });
});

describe('CreateWorkRoleSchema', () => {
  it('accepts role with title only', () => {
    const result = CreateWorkRoleSchema.safeParse({ title: 'Engineer' });
    expect(result.success).toBe(true);
  });

  it('accepts role with all fields', () => {
    const result = CreateWorkRoleSchema.safeParse({
      title: 'Engineer',
      startDate: '2020-01',
      endDate: '2024-01',
      workArrangement: 'Hybrid',
      responsibilities: ['Built things'],
      achievements: ['Won award'],
      technologies: ['React'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = CreateWorkRoleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid workArrangement', () => {
    const result = CreateWorkRoleSchema.safeParse({
      title: 'Dev',
      workArrangement: 'Invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateWorkRoleSchema', () => {
  it('accepts partial data', () => {
    const result = UpdateWorkRoleSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });
});

describe('CreateWorkProjectSchema', () => {
  it('accepts project with name only', () => {
    const result = CreateWorkProjectSchema.safeParse({ name: 'Migration' });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateWorkProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('CreateEducationSchema', () => {
  it('accepts full education entry', () => {
    const result = CreateEducationSchema.safeParse({
      institution: 'MIT',
      degree: 'B.S.',
      field: 'CS',
      gpa: '4.0',
    });
    expect(result.success).toBe(true);
  });

  it('accepts institution only', () => {
    const result = CreateEducationSchema.safeParse({ institution: 'MIT' });
    expect(result.success).toBe(true);
  });

  it('rejects missing institution', () => {
    const result = CreateEducationSchema.safeParse({ degree: 'B.S.' });
    expect(result.success).toBe(false);
  });
});

describe('UpdateEducationSchema', () => {
  it('accepts partial data', () => {
    const result = UpdateEducationSchema.safeParse({ degree: 'M.S.' });
    expect(result.success).toBe(true);
  });
});

describe('CreateSkillSchema', () => {
  it('accepts skill with name only', () => {
    const result = CreateSkillSchema.safeParse({ name: 'TypeScript' });
    expect(result.success).toBe(true);
  });

  it('accepts skill with category and level', () => {
    const result = CreateSkillSchema.safeParse({
      name: 'React',
      category: 'Frameworks',
      level: 'Expert',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateSkillSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid level', () => {
    const result = CreateSkillSchema.safeParse({ name: 'X', level: 'Guru' });
    expect(result.success).toBe(false);
  });
});

describe('UpdateSkillSchema', () => {
  it('accepts partial data', () => {
    const result = UpdateSkillSchema.safeParse({ level: 'Intermediate' });
    expect(result.success).toBe(true);
  });
});

describe('CreateCertificationSchema', () => {
  it('accepts certification with name only', () => {
    expect(CreateCertificationSchema.safeParse({ name: 'AWS' }).success).toBe(true);
  });
  it('rejects missing name', () => {
    expect(CreateCertificationSchema.safeParse({}).success).toBe(false);
  });
});

describe('CreateAwardSchema', () => {
  it('accepts award with title only', () => {
    expect(CreateAwardSchema.safeParse({ title: 'Best Paper' }).success).toBe(true);
  });
  it('rejects missing title', () => {
    expect(CreateAwardSchema.safeParse({}).success).toBe(false);
  });
});

describe('CreateProjectSchema', () => {
  it('accepts project with name only', () => {
    expect(CreateProjectSchema.safeParse({ name: 'Open Source' }).success).toBe(true);
  });
  it('rejects missing name', () => {
    expect(CreateProjectSchema.safeParse({}).success).toBe(false);
  });
});

describe('CreateVolunteeringRoleSchema', () => {
  it('accepts role with organization only', () => {
    expect(CreateVolunteeringRoleSchema.safeParse({ organization: 'Red Cross' }).success).toBe(
      true
    );
  });
  it('rejects missing organization', () => {
    expect(CreateVolunteeringRoleSchema.safeParse({}).success).toBe(false);
  });
});

describe('CreatePublicationSchema', () => {
  it('accepts publication with title only', () => {
    expect(CreatePublicationSchema.safeParse({ title: 'ML Paper' }).success).toBe(true);
  });
  it('rejects missing title', () => {
    expect(CreatePublicationSchema.safeParse({}).success).toBe(false);
  });
});

describe('ReorderSchema', () => {
  it('accepts array of strings', () => {
    expect(ReorderSchema.safeParse(['a', 'b', 'c']).success).toBe(true);
  });
  it('accepts empty array', () => {
    expect(ReorderSchema.safeParse([]).success).toBe(true);
  });
  it('rejects non-array', () => {
    expect(ReorderSchema.safeParse('not-array').success).toBe(false);
  });
});

describe('CreateMasterResumeSchema', () => {
  it('accepts valid resume name and language', () => {
    expect(CreateMasterResumeSchema.safeParse({ name: 'My Resume', language: 'en' }).success).toBe(
      true
    );
  });
  it('rejects missing name', () => {
    expect(CreateMasterResumeSchema.safeParse({ language: 'en' }).success).toBe(false);
  });
  it('rejects name over 60 chars', () => {
    expect(
      CreateMasterResumeSchema.safeParse({ name: 'x'.repeat(61), language: 'en' }).success
    ).toBe(false);
  });
});

describe('RenameMasterResumeSchema', () => {
  it('accepts valid name', () => {
    expect(RenameMasterResumeSchema.safeParse({ name: 'New Name' }).success).toBe(true);
  });
  it('rejects empty name', () => {
    expect(RenameMasterResumeSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('SetLanguageSchema', () => {
  it('accepts valid language code', () => {
    expect(SetLanguageSchema.safeParse({ language: 'de' }).success).toBe(true);
  });
  it('rejects missing language', () => {
    expect(SetLanguageSchema.safeParse({}).success).toBe(false);
  });
});
