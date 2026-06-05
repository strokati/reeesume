'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import {
  ContactInfoSchema,
  CreateWorkCompanySchema,
  UpdateWorkCompanySchema,
  CreateWorkRoleSchema,
  UpdateWorkRoleSchema,
  CreateWorkProjectSchema,
  UpdateWorkProjectSchema,
  CreateEducationSchema,
  UpdateEducationSchema,
  CreateSkillSchema,
  UpdateSkillSchema,
  CreateCertificationSchema,
  UpdateCertificationSchema,
  CreateAwardSchema,
  UpdateAwardSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateVolunteeringRoleSchema,
  UpdateVolunteeringRoleSchema,
  CreatePublicationSchema,
  UpdatePublicationSchema,
  ReorderSchema,
  CreateMasterResumeSchema,
  RenameMasterResumeSchema,
  SetLanguageSchema,
} from '@/lib/validations/master-resume';
import type {
  ContactInfoInput,
  CreateWorkCompanyInput,
  UpdateWorkCompanyInput,
  CreateWorkRoleInput,
  UpdateWorkRoleInput,
  CreateWorkProjectInput,
  UpdateWorkProjectInput,
  CreateEducationInput,
  UpdateEducationInput,
  CreateSkillInput,
  UpdateSkillInput,
  CreateCertificationInput,
  UpdateCertificationInput,
  CreateAwardInput,
  UpdateAwardInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateVolunteeringRoleInput,
  UpdateVolunteeringRoleInput,
  CreatePublicationInput,
  UpdatePublicationInput,
  CreateMasterResumeInput,
} from '@/lib/validations/master-resume';
import { ImportedResumeSchema, type ImportedResumeData } from '@/lib/ai/prompts/import-resume';

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  return session?.user?.id ?? 'local-user';
}

// =============================================================================
// Multi-Resume Management
// =============================================================================

async function verifyOwnership(userId: string, resumeId: string) {
  const resume = await db.masterResume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new Error('Resume not found.');
  return resume;
}

export async function createMasterResume(data: CreateMasterResumeInput): Promise<{ id: string }> {
  const userId = await requireAuth();
  const validated = CreateMasterResumeSchema.parse(data);
  const resume = await db.masterResume.create({
    data: { userId, name: validated.name, language: validated.language },
  });
  revalidatePath('/master-resume');
  return { id: resume.id };
}

export async function renameMasterResume(resumeId: string, name: string): Promise<void> {
  const userId = await requireAuth();
  await verifyOwnership(userId, resumeId);
  const validated = RenameMasterResumeSchema.parse({ name });
  await db.masterResume.update({ where: { id: resumeId }, data: { name: validated.name } });
  revalidatePath('/master-resume');
}

export async function setMasterResumeLanguage(resumeId: string, language: string): Promise<void> {
  const userId = await requireAuth();
  await verifyOwnership(userId, resumeId);
  const validated = SetLanguageSchema.parse({ language });
  await db.masterResume.update({ where: { id: resumeId }, data: { language: validated.language } });
  revalidatePath('/master-resume');
}

export async function setDefaultMasterResume(resumeId: string): Promise<void> {
  const userId = await requireAuth();
  const resume = await verifyOwnership(userId, resumeId);

  await db.$transaction([
    db.masterResume.updateMany({ where: { userId }, data: { isDefault: false } }),
    db.masterResume.update({ where: { id: resume.id }, data: { isDefault: true } }),
  ]);
  revalidatePath('/master-resume');
}

export async function deleteMasterResume(resumeId: string): Promise<void> {
  const userId = await requireAuth();
  const resume = await verifyOwnership(userId, resumeId);

  const totalCount = await db.masterResume.count({ where: { userId } });
  if (totalCount <= 1) {
    throw new Error('Cannot delete the only master resume.');
  }

  const linkedApps = await db.application.count({ where: { masterResumeId: resumeId } });
  if (linkedApps > 0) {
    throw new Error(
      `Cannot delete a resume linked to ${linkedApps} application(s). Change the application's resume first.`
    );
  }

  const wasDefault = resume.isDefault;

  await db.masterResume.delete({ where: { id: resumeId } });

  if (wasDefault) {
    const nextDefault = await db.masterResume.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    if (nextDefault) {
      await db.masterResume.update({
        where: { id: nextDefault.id },
        data: { isDefault: true },
      });
    }
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Contact Info, Target Title, Professional Summary
// =============================================================================

export async function updateContactInfo(resumeId: string, data: ContactInfoInput): Promise<void> {
  await requireAuth();
  const validated = ContactInfoSchema.parse(data);
  try {
    await db.masterResume.update({ where: { id: resumeId }, data: { contactInfo: validated } });
  } catch {
    throw new Error('Failed to update contact info.');
  }
  revalidatePath('/master-resume');
}

export async function updateTargetTitle(resumeId: string, targetTitle: string): Promise<void> {
  await requireAuth();
  const validated = z.string().parse(targetTitle);
  try {
    await db.masterResume.update({ where: { id: resumeId }, data: { targetTitle: validated } });
  } catch {
    throw new Error('Failed to update target title.');
  }
  revalidatePath('/master-resume');
}

export async function updateProfessionalSummary(resumeId: string, summary: string): Promise<void> {
  await requireAuth();
  const validated = z.string().parse(summary);
  try {
    await db.masterResume.update({
      where: { id: resumeId },
      data: { professionalSummary: validated },
    });
  } catch {
    throw new Error('Failed to update professional summary.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Work Companies
// =============================================================================

export async function createWorkCompany(
  resumeId: string,
  data: CreateWorkCompanyInput
): Promise<ReturnType<typeof db.workCompany.create>> {
  await requireAuth();
  const validated = CreateWorkCompanySchema.parse(data);
  try {
    const count = await db.workCompany.count({ where: { resumeId } });
    return db.workCompany.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create company.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateWorkCompany(id: string, data: UpdateWorkCompanyInput): Promise<void> {
  await requireAuth();
  const validated = UpdateWorkCompanySchema.parse(data);
  try {
    await db.workCompany.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update company.');
  }
  revalidatePath('/master-resume');
}

export async function deleteWorkCompany(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.workCompany.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete company.');
  }
  revalidatePath('/master-resume');
}

export async function reorderWorkCompanies(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.workCompany.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder companies.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Work Roles
// =============================================================================

export async function createWorkRoleWithCompany(
  resumeId: string,
  data: {
    companyName: string;
    companyLocation?: string;
    employmentType?: string;
    roleTitle: string;
    startDate?: string;
    endDate?: string;
    workArrangement?: 'On-Site' | 'Hybrid' | 'Remote';
  }
): Promise<void> {
  await requireAuth();
  const schema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    companyLocation: z.string().optional(),
    employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']).optional(),
    roleTitle: z.string().min(1, 'Role title is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    workArrangement: z.enum(['On-Site', 'Hybrid', 'Remote']).optional(),
  });
  const validated = schema.parse(data);
  try {
    const companyCount = await db.workCompany.count({ where: { resumeId } });
    const company = await db.workCompany.create({
      data: {
        resumeId,
        name: validated.companyName,
        location: validated.companyLocation,
        employmentType: validated.employmentType,
        order: companyCount,
      },
    });
    await db.workRole.create({
      data: {
        companyId: company.id,
        title: validated.roleTitle,
        startDate: validated.startDate,
        endDate: validated.endDate,
        workArrangement: validated.workArrangement,
        order: 0,
      },
    });
  } catch {
    throw new Error('Failed to create role.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function createWorkRole(
  companyId: string,
  data: CreateWorkRoleInput
): Promise<ReturnType<typeof db.workRole.create>> {
  await requireAuth();
  const validated = CreateWorkRoleSchema.parse(data);
  try {
    const count = await db.workRole.count({ where: { companyId } });
    return db.workRole.create({ data: { companyId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create role.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateWorkRole(id: string, data: UpdateWorkRoleInput): Promise<void> {
  await requireAuth();
  const validated = UpdateWorkRoleSchema.parse(data);
  try {
    await db.workRole.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update role.');
  }
  revalidatePath('/master-resume');
}

export async function deleteWorkRole(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.workRole.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete role.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Work Projects
// =============================================================================

export async function createWorkProject(
  roleId: string,
  data: CreateWorkProjectInput
): Promise<ReturnType<typeof db.workProject.create>> {
  await requireAuth();
  const validated = CreateWorkProjectSchema.parse(data);
  try {
    const count = await db.workProject.count({ where: { roleId } });
    return db.workProject.create({ data: { roleId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create project.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateWorkProject(id: string, data: UpdateWorkProjectInput): Promise<void> {
  await requireAuth();
  const validated = UpdateWorkProjectSchema.parse(data);
  try {
    await db.workProject.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update project.');
  }
  revalidatePath('/master-resume');
}

export async function deleteWorkProject(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.workProject.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete project.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Education
// =============================================================================

export async function createEducation(
  resumeId: string,
  data: CreateEducationInput
): Promise<ReturnType<typeof db.education.create>> {
  await requireAuth();
  const validated = CreateEducationSchema.parse(data);
  try {
    const count = await db.education.count({ where: { resumeId } });
    return db.education.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create education entry.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateEducation(id: string, data: UpdateEducationInput): Promise<void> {
  await requireAuth();
  const validated = UpdateEducationSchema.parse(data);
  try {
    await db.education.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update education entry.');
  }
  revalidatePath('/master-resume');
}

export async function deleteEducation(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.education.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete education entry.');
  }
  revalidatePath('/master-resume');
}

export async function reorderEducation(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.education.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder education entries.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Skills
// =============================================================================

export async function createSkill(
  resumeId: string,
  data: CreateSkillInput
): Promise<ReturnType<typeof db.skill.create>> {
  await requireAuth();
  const validated = CreateSkillSchema.parse(data);
  try {
    const count = await db.skill.count({ where: { resumeId } });
    return db.skill.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create skill.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateSkill(id: string, data: UpdateSkillInput): Promise<void> {
  await requireAuth();
  const validated = UpdateSkillSchema.parse(data);
  try {
    await db.skill.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update skill.');
  }
  revalidatePath('/master-resume');
}

export async function deleteSkill(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.skill.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete skill.');
  }
  revalidatePath('/master-resume');
}

export async function reorderSkills(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) => db.skill.update({ where: { id: itemId }, data: { order } }))
    );
  } catch {
    throw new Error('Failed to reorder skills.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Certifications
// =============================================================================

export async function createCertification(
  resumeId: string,
  data: CreateCertificationInput
): Promise<ReturnType<typeof db.certification.create>> {
  await requireAuth();
  const validated = CreateCertificationSchema.parse(data);
  try {
    const count = await db.certification.count({ where: { resumeId } });
    return db.certification.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create certification.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateCertification(
  id: string,
  data: UpdateCertificationInput
): Promise<void> {
  await requireAuth();
  const validated = UpdateCertificationSchema.parse(data);
  try {
    await db.certification.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update certification.');
  }
  revalidatePath('/master-resume');
}

export async function deleteCertification(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.certification.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete certification.');
  }
  revalidatePath('/master-resume');
}

export async function reorderCertifications(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.certification.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder certifications.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Awards
// =============================================================================

export async function createAward(
  resumeId: string,
  data: CreateAwardInput
): Promise<ReturnType<typeof db.award.create>> {
  await requireAuth();
  const validated = CreateAwardSchema.parse(data);
  try {
    const count = await db.award.count({ where: { resumeId } });
    return db.award.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create award.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateAward(id: string, data: UpdateAwardInput): Promise<void> {
  await requireAuth();
  const validated = UpdateAwardSchema.parse(data);
  try {
    await db.award.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update award.');
  }
  revalidatePath('/master-resume');
}

export async function deleteAward(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.award.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete award.');
  }
  revalidatePath('/master-resume');
}

export async function reorderAwards(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) => db.award.update({ where: { id: itemId }, data: { order } }))
    );
  } catch {
    throw new Error('Failed to reorder awards.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Projects (personal / open-source)
// =============================================================================

export async function createProject(
  resumeId: string,
  data: CreateProjectInput
): Promise<ReturnType<typeof db.project.create>> {
  await requireAuth();
  const validated = CreateProjectSchema.parse(data);
  try {
    const count = await db.project.count({ where: { resumeId } });
    return db.project.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create project.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<void> {
  await requireAuth();
  const validated = UpdateProjectSchema.parse(data);
  try {
    await db.project.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update project.');
  }
  revalidatePath('/master-resume');
}

export async function deleteProject(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.project.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete project.');
  }
  revalidatePath('/master-resume');
}

export async function reorderProjects(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.project.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder projects.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Volunteering Roles
// =============================================================================

export async function createVolunteeringRole(
  resumeId: string,
  data: CreateVolunteeringRoleInput
): Promise<ReturnType<typeof db.volunteeringRole.create>> {
  await requireAuth();
  const validated = CreateVolunteeringRoleSchema.parse(data);
  try {
    const count = await db.volunteeringRole.count({ where: { resumeId } });
    return db.volunteeringRole.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create volunteering role.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updateVolunteeringRole(
  id: string,
  data: UpdateVolunteeringRoleInput
): Promise<void> {
  await requireAuth();
  const validated = UpdateVolunteeringRoleSchema.parse(data);
  try {
    await db.volunteeringRole.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update volunteering role.');
  }
  revalidatePath('/master-resume');
}

export async function deleteVolunteeringRole(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.volunteeringRole.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete volunteering role.');
  }
  revalidatePath('/master-resume');
}

export async function reorderVolunteeringRoles(
  resumeId: string,
  orderedIds: string[]
): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.volunteeringRole.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder volunteering roles.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Publications
// =============================================================================

export async function createPublication(
  resumeId: string,
  data: CreatePublicationInput
): Promise<ReturnType<typeof db.publication.create>> {
  await requireAuth();
  const validated = CreatePublicationSchema.parse(data);
  try {
    const count = await db.publication.count({ where: { resumeId } });
    return db.publication.create({ data: { resumeId, ...validated, order: count } });
  } catch {
    throw new Error('Failed to create publication.');
  } finally {
    revalidatePath('/master-resume');
  }
}

export async function updatePublication(id: string, data: UpdatePublicationInput): Promise<void> {
  await requireAuth();
  const validated = UpdatePublicationSchema.parse(data);
  try {
    await db.publication.update({ where: { id }, data: validated });
  } catch {
    throw new Error('Failed to update publication.');
  }
  revalidatePath('/master-resume');
}

export async function deletePublication(id: string): Promise<void> {
  await requireAuth();
  try {
    await db.publication.delete({ where: { id } });
  } catch {
    throw new Error('Failed to delete publication.');
  }
  revalidatePath('/master-resume');
}

export async function reorderPublications(resumeId: string, orderedIds: string[]): Promise<void> {
  await requireAuth();
  const validated = ReorderSchema.parse(orderedIds);
  try {
    await db.$transaction(
      validated.map((itemId, order) =>
        db.publication.update({ where: { id: itemId }, data: { order } })
      )
    );
  } catch {
    throw new Error('Failed to reorder publications.');
  }
  revalidatePath('/master-resume');
}

// =============================================================================
// Import Resume (AI extraction → bulk write)
// =============================================================================

export async function applyImportedResume(
  resumeId: string,
  data: ImportedResumeData,
  mode: 'overwrite' | 'merge'
): Promise<void> {
  const userId = await requireAuth();
  const importedData = ImportedResumeSchema.parse(data);

  const resume = await db.masterResume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new Error('Resume not found.');
  }

  await db.$transaction(async (tx) => {
    if (mode === 'overwrite') {
      await tx.workCompany.deleteMany({ where: { resumeId } });
      await tx.education.deleteMany({ where: { resumeId } });
      await tx.skill.deleteMany({ where: { resumeId } });
      await tx.certification.deleteMany({ where: { resumeId } });
      await tx.award.deleteMany({ where: { resumeId } });
      await tx.project.deleteMany({ where: { resumeId } });
      await tx.volunteeringRole.deleteMany({ where: { resumeId } });
      await tx.publication.deleteMany({ where: { resumeId } });
    }

    const flatUpdates: Record<string, unknown> = {};
    if (importedData.contactInfo) {
      const ci = { ...importedData.contactInfo } as Record<string, unknown>;
      for (const [key, val] of Object.entries(ci)) {
        if (typeof val !== 'string') continue;
        const lower = val.toLowerCase();
        if (!ci.linkedin && lower.includes('linkedin.com')) {
          ci.linkedin = val;
          if (key === 'website') delete ci.website;
        }
        if (!ci.github && lower.includes('github.com')) {
          ci.github = val;
          if (key === 'website') delete ci.website;
        }
      }
      flatUpdates.contactInfo = ContactInfoSchema.parse(ci);
    }
    if (importedData.targetTitle) flatUpdates.targetTitle = importedData.targetTitle;
    if (importedData.professionalSummary)
      flatUpdates.professionalSummary = importedData.professionalSummary;
    if (Object.keys(flatUpdates).length > 0) {
      await tx.masterResume.update({ where: { id: resumeId }, data: flatUpdates });
    }

    if (importedData.workCompanies?.length) {
      const existingCount = await tx.workCompany.count({ where: { resumeId } });
      for (let ci = 0; ci < importedData.workCompanies.length; ci++) {
        const c = importedData.workCompanies[ci];
        const company = await tx.workCompany.create({
          data: {
            resumeId,
            name: c.name ?? '',
            location: c.location ?? undefined,
            employmentType: c.employmentType ?? undefined,
            startDate: c.startDate ?? undefined,
            endDate: c.endDate ?? undefined,
            order: existingCount + ci,
          },
        });
        if (c.roles?.length) {
          for (let ri = 0; ri < c.roles.length; ri++) {
            const r = c.roles[ri];
            const role = await tx.workRole.create({
              data: {
                companyId: company.id,
                title: r.title ?? '',
                startDate: r.startDate ?? undefined,
                endDate: r.endDate ?? undefined,
                workArrangement: r.workArrangement ?? undefined,
                responsibilities: r.responsibilities ?? undefined,
                achievements: r.achievements ?? undefined,
                technologies: r.technologies ?? undefined,
                order: ri,
              },
            });
            if (r.projects?.length) {
              await tx.workProject.createMany({
                data: r.projects
                  .filter((p) => p.name)
                  .map((p, pi) => ({
                  roleId: role.id,
                  name: p.name!,
                  startDate: p.startDate ?? undefined,
                  endDate: p.endDate ?? undefined,
                  description: p.description ?? undefined,
                  contribution: p.contribution ?? undefined,
                  responsibilities: p.responsibilities ?? undefined,
                  technologies: p.technologies ?? undefined,
                  outcome: p.outcome ?? undefined,
                  order: pi,
                })),
              });
            }
          }
        }
      }
    }

    if (importedData.educations?.length) {
      const count = await tx.education.count({ where: { resumeId } });
      await tx.education.createMany({
        data: importedData.educations
          .filter((e) => e.institution)
          .map((e, i) => ({
          resumeId,
          institution: e.institution!,
          degree: e.degree ?? undefined,
          field: e.field ?? undefined,
          location: e.location ?? undefined,
          startDate: e.startDate ?? undefined,
          endDate: e.endDate ?? undefined,
          gpa: e.gpa ?? undefined,
          honors: e.honors ?? undefined,
          activities: e.activities ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.skills?.length) {
      const count = await tx.skill.count({ where: { resumeId } });
      await tx.skill.createMany({
        data: importedData.skills
          .filter((s) => s.name)
          .map((s, i) => ({
          resumeId,
          name: s.name!,
          category: s.category ?? undefined,
          level: s.level ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.certifications?.length) {
      const count = await tx.certification.count({ where: { resumeId } });
      await tx.certification.createMany({
        data: importedData.certifications
          .filter((c) => c.name)
          .map((c, i) => ({
          resumeId,
          name: c.name!,
          issuer: c.issuer ?? undefined,
          issueDate: c.issueDate ?? undefined,
          expiryDate: c.expiryDate ?? undefined,
          credentialId: c.credentialId ?? undefined,
          url: c.url ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.awards?.length) {
      const count = await tx.award.count({ where: { resumeId } });
      await tx.award.createMany({
        data: importedData.awards
          .filter((a) => a.title)
          .map((a, i) => ({
          resumeId,
          title: a.title!,
          issuer: a.issuer ?? undefined,
          date: a.date ?? undefined,
          description: a.description ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.projects?.length) {
      const count = await tx.project.count({ where: { resumeId } });
      await tx.project.createMany({
        data: importedData.projects
          .filter((p) => p.name)
          .map((p, i) => ({
          resumeId,
          name: p.name!,
          description: p.description ?? undefined,
          role: p.role ?? undefined,
          startDate: p.startDate ?? undefined,
          endDate: p.endDate ?? undefined,
          technologies: p.technologies ?? undefined,
          url: p.url ?? undefined,
          repoUrl: p.repoUrl ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.volunteeringRoles?.length) {
      const count = await tx.volunteeringRole.count({ where: { resumeId } });
      await tx.volunteeringRole.createMany({
        data: importedData.volunteeringRoles
          .filter((v) => v.organization)
          .map((v, i) => ({
          resumeId,
          organization: v.organization!,
          role: v.role ?? undefined,
          location: v.location ?? undefined,
          startDate: v.startDate ?? undefined,
          endDate: v.endDate ?? undefined,
          responsibilities: v.responsibilities ?? undefined,
          order: count + i,
        })),
      });
    }

    if (importedData.publications?.length) {
      const count = await tx.publication.count({ where: { resumeId } });
      await tx.publication.createMany({
        data: importedData.publications
          .filter((p) => p.title)
          .map((p, i) => ({
          resumeId,
          title: p.title!,
          authors: p.authors ?? undefined,
          publisher: p.publisher ?? undefined,
          date: p.date ?? undefined,
          url: p.url ?? undefined,
          doi: p.doi ?? undefined,
          description: p.description ?? undefined,
          order: count + i,
        })),
      });
    }
  });

  revalidatePath('/master-resume');
}
