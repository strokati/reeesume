import { db } from '@/lib/db/client';

export async function getResumeDrafts(applicationId: string) {
	return db.resumeDraft.findMany({
		where: { applicationId },
		orderBy: { createdAt: 'desc' },
	});
}

export async function getActiveResumeDraft(applicationId: string) {
	const draft = await db.resumeDraft.findFirst({
		where: { applicationId, isActive: true },
	});
	if (draft) return draft;
	// Fall back to most recent
	return db.resumeDraft.findFirst({
		where: { applicationId },
		orderBy: { createdAt: 'desc' },
	});
}

export async function getResumeDraftById(id: string) {
	return db.resumeDraft.findUnique({ where: { id } });
}
