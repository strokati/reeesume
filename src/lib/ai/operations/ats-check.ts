import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import { buildAtsCheckSystem, buildAtsCheckPrompt, resumeContentToText } from '@/lib/ai/prompts/ats-check';
import { db } from '@/lib/db/client';

export async function runAtsCheck(
	userId: string,
	resumeDraftId: string,
	providerId: string,
) {
	const startTime = Date.now();

	const draft = await db.resumeDraft.findUnique({
		where: { id: resumeDraftId },
		include: { application: { include: { vacancy: true, masterResume: { select: { language: true } } } } },
	});

	if (!draft || !draft.application.vacancy) {
		throw new Error('Resume draft or vacancy not found.');
	}

	if (!draft.application.vacancy.rawText) {
		throw new Error('No job posting text available for ATS check.');
	}

	const language = draft.application.masterResume?.language ?? 'en';
	const resumeText = resumeContentToText(draft.content);
	const vacancyText = draft.application.vacancy.rawText;

	const { model, modelName } = await getProviderForUser(userId, providerId);

	const result = streamText({
		model,
		system: buildAtsCheckSystem(language),
		prompt: buildAtsCheckPrompt(resumeText, vacancyText),
		onFinish: async (event) => {
			const durationMs = Date.now() - startTime;
			const usage = event.totalUsage;

			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'ats-check',
						providerId,
						model: modelName,
						applicationId: draft.applicationId,
						tokensIn: usage.inputTokens ?? null,
						tokensOut: usage.outputTokens ?? null,
						durationMs,
						error: null,
					},
				});

				const text = event.text;
				if (text) {
					try {
						const json = JSON.parse(text);
						await db.resumeDraft.update({
							where: { id: resumeDraftId },
							data: { atsScore: json },
						});
					} catch {
						await db.resumeDraft.update({
							where: { id: resumeDraftId },
							data: { atsScore: { raw: text } },
						});
					}
				}
			} catch (logErr) {
				console.error('Failed to log ATS check:', logErr);
			}
		},
		onError: async (err) => {
			const durationMs = Date.now() - startTime;
			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'ats-check',
						providerId,
						model: modelName,
						applicationId: draft.applicationId,
						durationMs,
						error: err instanceof Error ? err.message : 'Unknown error',
					},
				});
			} catch (logErr) {
				console.error('Failed to log ATS error:', logErr);
			}
		},
	});

	return result;
}
