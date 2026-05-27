import { db } from '@/lib/db/client';
import type {
  WorkCompanyWithRoles,
  FullMasterResume,
  MasterResumeSummary,
} from '@/types/master-resume';

// =============================================================================
// List / get / resolve
// =============================================================================

export async function getMasterResumes(userId: string): Promise<MasterResumeSummary[]> {
  return db.masterResume.findMany({
    where: { userId },
    select: { id: true, name: true, language: true, isDefault: true, updatedAt: true },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

export async function getMasterResumeById(userId: string, resumeId: string) {
  return db.masterResume.findFirst({
    where: { id: resumeId, userId },
  });
}

export async function getOrCreateDefaultMasterResume(userId: string) {
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: userId === 'local-user' ? 'local@localhost' : '' },
  });

  let resume = await db.masterResume.findFirst({ where: { userId, isDefault: true } });
  if (!resume) {
    resume = await db.masterResume.findFirst({ where: { userId } });
  }
  if (!resume) {
    resume = await db.masterResume.create({
      data: { userId, name: 'Default', language: 'en', isDefault: true },
    });
  }
  if (!resume.isDefault) {
    await db.masterResume.update({ where: { id: resume.id }, data: { isDefault: true } });
    resume = { ...resume, isDefault: true };
  }
  return resume;
}

/** @deprecated Use getOrCreateDefaultMasterResume instead. */
export async function getOrCreateMasterResume(userId: string) {
  return getOrCreateDefaultMasterResume(userId);
}

export async function resolveResumeId(userId: string, masterResumeId: string | null | undefined) {
  if (masterResumeId) {
    const resume = await db.masterResume.findFirst({ where: { id: masterResumeId, userId } });
    if (resume) return resume;
  }
  return getOrCreateDefaultMasterResume(userId);
}

// =============================================================================
// Section queries
// =============================================================================

export async function getWorkExperience(resumeId: string): Promise<WorkCompanyWithRoles[]> {
  return db.workCompany.findMany({
    where: { resumeId },
    include: { roles: { include: { projects: true }, orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });
}

export async function getEducation(resumeId: string) {
  return db.education.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getSkills(resumeId: string) {
  return db.skill.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getCertifications(resumeId: string) {
  return db.certification.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getAwards(resumeId: string) {
  return db.award.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getProjects(resumeId: string) {
  return db.project.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getVolunteeringRoles(resumeId: string) {
  return db.volunteeringRole.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

export async function getPublications(resumeId: string) {
  return db.publication.findMany({ where: { resumeId }, orderBy: { order: 'asc' } });
}

// =============================================================================
// Full resume content
// =============================================================================

export async function getFullMasterResume(
  userId: string,
  masterResumeId?: string | null
): Promise<FullMasterResume> {
  const resume = await resolveResumeId(userId, masterResumeId);
  const full = await db.masterResume.findUniqueOrThrow({
    where: { id: resume.id },
    include: {
      workCompanies: {
        include: { roles: { include: { projects: true }, orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      educations: { orderBy: { order: 'asc' } },
      skills: { orderBy: { order: 'asc' } },
      certifications: { orderBy: { order: 'asc' } },
      awards: { orderBy: { order: 'asc' } },
      projects: { orderBy: { order: 'asc' } },
      volunteeringRoles: { orderBy: { order: 'asc' } },
      publications: { orderBy: { order: 'asc' } },
    },
  });
  return full;
}
