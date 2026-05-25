import { db } from '@/lib/db/client';

export async function getCoverLetterDrafts(applicationId: string) {
	return db.coverLetterDraft.findMany({
		where: { applicationId },
		orderBy: { createdAt: 'desc' },
	});
}

export async function getActiveCoverLetterDraft(applicationId: string) {
	const draft = await db.coverLetterDraft.findFirst({
		where: { applicationId, isActive: true },
	});
	if (draft) return draft;
	return db.coverLetterDraft.findFirst({
		where: { applicationId },
		orderBy: { createdAt: 'desc' },
	});
}
