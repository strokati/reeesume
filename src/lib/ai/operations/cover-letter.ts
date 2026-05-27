import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import { buildCoverLetterSystem, buildCoverLetterPrompt, type CoverLetterTone } from '@/lib/ai/prompts/cover-letter';
import { getFullMasterResume } from '@/server/queries/master-resume';
import { summarizeMasterResume } from '@/lib/ai/prompts/analyze-vacancy';
import { resumeContentToText } from '@/lib/ai/prompts/ats-check';
import { db } from '@/lib/db/client';

export async function generateCoverLetter(
	userId: string,
	applicationId: string,
	tone: CoverLetterTone,
	providerId: string,
) {
	const startTime = Date.now();

	const application = await db.application.findUnique({
		where: { id: applicationId },
		include: { vacancy: true, masterResume: { select: { language: true } }, resumeDrafts: { orderBy: { createdAt: 'desc' }, take: 1 } },
	});

	if (!application || !application.vacancy) {
		throw new Error('Application or vacancy not found.');
	}

	if (!application.vacancy.rawText) {
		throw new Error('No job posting text available.');
	}

	const language = application.masterResume?.language ?? 'en';
	const fullResume = await getFullMasterResume(userId, application.masterResumeId);
	const resumeSummary = summarizeMasterResume(fullResume as unknown as Parameters<typeof summarizeMasterResume>[0]);

	const activeDraft = application.resumeDrafts[0];
	const resumeText = activeDraft?.content
		? resumeContentToText(activeDraft.content)
		: resumeSummary;

	const contactInfo = (fullResume as { contactInfo?: unknown }).contactInfo as Record<string, unknown> | null;
	const contactName = (contactInfo?.name as string) || 'Candidate';

	const { model, modelName } = await getProviderForUser(userId, providerId);

	const result = streamText({
		model,
		system: buildCoverLetterSystem(language),
		prompt: buildCoverLetterPrompt({
			tone,
			resumeText,
			vacancyText: application.vacancy.rawText,
			contactName,
			companyName: application.vacancy.companyName,
			jobTitle: application.vacancy.jobTitle,
		}),
		onFinish: async (event) => {
			const durationMs = Date.now() - startTime;
			const usage = event.totalUsage;

			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'cover-letter',
						providerId,
						model: modelName,
						applicationId,
						tokensIn: usage.inputTokens ?? null,
						tokensOut: usage.outputTokens ?? null,
						durationMs,
						error: null,
					},
				});
			} catch (logErr) {
				console.error('Failed to log AI call:', logErr);
			}
		},
		onError: async (err) => {
			const durationMs = Date.now() - startTime;
			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'cover-letter',
						providerId,
						model: modelName,
						applicationId,
						durationMs,
						error: err instanceof Error ? err.message : 'Unknown error',
					},
				});
			} catch (logErr) {
				console.error('Failed to log AI error:', logErr);
			}
		},
	});

	return result;
}
