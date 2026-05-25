import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { getApplicationById } from '@/server/queries/applications';
import { getCoverLetterDrafts, getActiveCoverLetterDraft } from '@/server/queries/cover-letters';
import { getAiProviderConfigs } from '@/server/queries/settings';
import { createCoverLetterDraft } from '@/server/actions/cover-letters';
import { CoverLetterEditorView } from './_components/CoverLetterEditorView';
import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export default async function CoverLetterEditorPage({
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
		getCoverLetterDrafts(applicationId),
		getAiProviderConfigs(userId),
	]);

	let activeDraft = await getActiveCoverLetterDraft(applicationId);
	if (!activeDraft && drafts.length === 0) {
		const draftId = await createCoverLetterDraft(applicationId, 'Draft 1');
		activeDraft = await db.coverLetterDraft.findUnique({ where: { id: draftId } });
	}

	return (
		<CoverLetterEditorView
			application={application}
			drafts={drafts}
			activeDraft={activeDraft}
			aiConfigs={aiConfigs}
		/>
	);
}
