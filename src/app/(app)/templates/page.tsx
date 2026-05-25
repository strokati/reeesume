import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { SAMPLE_RESUME_DATA } from '@/lib/templates/sample-data';
import { TEMPLATES } from '@/lib/templates';
import { convertDraftToResumeData } from '@/lib/templates/convert-draft';
import type { ResumeDraftContent } from '@/types/resume-draft';
import { TemplatesView } from './_components/TemplatesView';

export default async function TemplatesPage() {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	let previewData = SAMPLE_RESUME_DATA;
	let activeDraftId: string | null = null;
	let activeTemplateId = 'ats-simple';

	const activeDraft = await db.resumeDraft.findFirst({
		where: { isActive: true, application: { vacancy: { userId } } },
		orderBy: { updatedAt: 'desc' },
	});

	if (activeDraft?.content) {
		previewData = convertDraftToResumeData(activeDraft.content as unknown as ResumeDraftContent);
		activeDraftId = activeDraft.id;
		activeTemplateId = activeDraft.templateId;
	}

	const templateList = Object.values(TEMPLATES).map((t) => ({
		id: t.id,
		name: t.name,
		description: t.description,
	}));

	return (
		<TemplatesView
			templates={templateList}
			previewData={previewData}
			activeDraftId={activeDraftId}
			activeTemplateId={activeTemplateId}
		/>
	);
}
