'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/master-resume/SectionCard';
import { ContactInfoForm } from '@/components/master-resume/ContactInfoForm';
import { TargetTitleForm } from '@/components/master-resume/TargetTitleForm';
import { SummaryEditor } from '@/components/master-resume/SummaryEditor';
import type { ContactInfoInput } from '@/lib/validations/master-resume';

export function MasterResumeView({
	resume,
}: {
	resume: {
		id: string;
		contactInfo?: unknown;
		targetTitle?: string | null;
		professionalSummary?: string | null;
	};
}) {
	const contactInfo = (resume.contactInfo as ContactInfoInput | null) ?? undefined;

	return (
		<div className="space-y-6">
			<PageHeader title="Master Resume" description="Your complete career history — the single source of truth." />

			<SectionCard title="Contact Information">
				<ContactInfoForm resumeId={resume.id} defaultValues={contactInfo} />
			</SectionCard>

			<SectionCard title="Target Title">
				<TargetTitleForm resumeId={resume.id} defaultValue={resume.targetTitle} />
			</SectionCard>

			<SectionCard title="Professional Summary" collapsible>
				<SummaryEditor resumeId={resume.id} defaultValue={resume.professionalSummary} />
			</SectionCard>
		</div>
	);
}
