import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getApplicationById } from '@/server/queries/applications';
import { getResumeDrafts, getActiveResumeDraft } from '@/server/queries/resume-drafts';
import { getAiProviderConfigs } from '@/server/queries/settings';
import { ResumeEditorView } from './_components/ResumeEditorView';
import { createResumeDraft } from '@/server/actions/resume-drafts';

export const dynamic = 'force-dynamic';

export default async function ResumeEditorPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();
	if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
	const userId = session?.user?.id ?? 'local-user';

	const { id: applicationId } = await params;
	const application = await getApplicationById(applicationId, userId);
	if (!application) notFound();

	const [drafts, aiConfigs] = await Promise.all([
		getResumeDrafts(applicationId),
		getAiProviderConfigs(userId),
	]);

	// Auto-create a draft if none exists
	let activeDraft = await getActiveResumeDraft(applicationId);
	if (!activeDraft && drafts.length === 0) {
		const draftId = await createResumeDraft(applicationId, 'Draft 1');
		activeDraft = await db.resumeDraft.findUnique({ where: { id: draftId } });
	}

	return (
		<ResumeEditorView
			application={application}
			drafts={drafts}
			activeDraft={activeDraft}
			aiConfigs={aiConfigs}
		/>
	);
}

// Need db import for the auto-create fallback
import { db } from '@/lib/db/client';
