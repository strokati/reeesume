import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import {
  getMasterResumeById,
  getMasterResumes,
  getWorkExperience,
  getEducation,
  getSkills,
  getCertifications,
  getAwards,
  getProjects,
  getVolunteeringRoles,
  getPublications,
} from '@/server/queries/master-resume';
import { getAiProviderConfigs } from '@/server/queries/settings';
import { MasterResumeView } from '../_components/MasterResumeView';

export const dynamic = 'force-dynamic';

export default async function MasterResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = await params;
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  const userId = session?.user?.id ?? 'local-user';

  const resume = await getMasterResumeById(userId, resumeId);
  if (!resume) notFound();

  const resumes = await getMasterResumes(userId);

  const [
    companies,
    education,
    skills,
    certifications,
    awards,
    projects,
    volunteeringRoles,
    publications,
    aiConfigs,
  ] = await Promise.all([
    getWorkExperience(resume.id),
    getEducation(resume.id),
    getSkills(resume.id),
    getCertifications(resume.id),
    getAwards(resume.id),
    getProjects(resume.id),
    getVolunteeringRoles(resume.id),
    getPublications(resume.id),
    getAiProviderConfigs(userId),
  ]);

  return (
    <MasterResumeView
      resume={resume}
      resumes={resumes}
      companies={companies}
      education={education}
      skills={skills}
      certifications={certifications}
      awards={awards}
      projects={projects}
      volunteeringRoles={volunteeringRoles}
      publications={publications}
      aiConfigs={aiConfigs}
    />
  );
}
