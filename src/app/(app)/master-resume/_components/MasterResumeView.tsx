'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/master-resume/SectionCard';
import { ContactInfoForm } from '@/components/master-resume/ContactInfoForm';
import { TargetTitleForm } from '@/components/master-resume/TargetTitleForm';
import { SummaryEditor } from '@/components/master-resume/SummaryEditor';
import { WorkExperienceSection } from '@/components/master-resume/WorkExperienceSection';
import { EducationSection } from '@/components/master-resume/EducationSection';
import { SkillsSection } from '@/components/master-resume/SkillsSection';
import { CertificationSection } from '@/components/master-resume/CertificationSection';
import { AwardSection } from '@/components/master-resume/AwardSection';
import { ProjectSection } from '@/components/master-resume/ProjectSection';
import { VolunteeringSection } from '@/components/master-resume/VolunteeringSection';
import { PublicationSection } from '@/components/master-resume/PublicationSection';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { ContactInfoInput } from '@/lib/validations/master-resume';
import type { WorkCompanyWithRoles } from '@/types/master-resume';
import type { Education, Skill, Certification, Award, Project, VolunteeringRole, Publication } from '@prisma/client';

export function MasterResumeView({
	resume,
	companies,
	education,
	skills,
	certifications,
	awards,
	projects,
	volunteeringRoles,
	publications,
}: {
	resume: {
		id: string;
		contactInfo?: unknown;
		targetTitle?: string | null;
		professionalSummary?: string | null;
	};
	companies: WorkCompanyWithRoles[];
	education: Education[];
	skills: Skill[];
	certifications: Certification[];
	awards: Award[];
	projects: Project[];
	volunteeringRoles: VolunteeringRole[];
	publications: Publication[];
}) {
	const contactInfo = (resume.contactInfo as ContactInfoInput | null) ?? undefined;

	return (
		<div className="space-y-6">
			<PageHeader title="Master Resume" description="Your complete career history — the single source of truth." />

			<SectionCard
				title="Contact Information"
				action={
					<Button form="contact-info-form" type="submit" size="sm">
						<Save className="h-4 w-4 mr-1" />
						Save
					</Button>
				}
			>
				<ContactInfoForm resumeId={resume.id} defaultValues={contactInfo} />
			</SectionCard>

			<SectionCard title="Target Title">
				<TargetTitleForm resumeId={resume.id} defaultValue={resume.targetTitle} />
			</SectionCard>

			<SectionCard title="Professional Summary" collapsible>
				<SummaryEditor resumeId={resume.id} defaultValue={resume.professionalSummary} />
			</SectionCard>

			<WorkExperienceSection companies={companies} resumeId={resume.id} />
			<EducationSection education={education} resumeId={resume.id} />
			<SkillsSection skills={skills} resumeId={resume.id} />
			<CertificationSection certifications={certifications} resumeId={resume.id} />
			<AwardSection awards={awards} resumeId={resume.id} />
			<ProjectSection projects={projects} resumeId={resume.id} />
			<VolunteeringSection roles={volunteeringRoles} resumeId={resume.id} />
			<PublicationSection publications={publications} resumeId={resume.id} />
		</div>
	);
}
