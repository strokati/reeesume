import { streamObject } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import { IMPORT_RESUME_SYSTEM } from '@/lib/ai/prompts/import-resume';
import { db } from '@/lib/db/client';

export async function importResume(userId: string, fileText: string, providerId: string) {
	const startTime = Date.now();
	const { model, modelName } = await getProviderForUser(userId, providerId);

	const result = streamObject({
		model,
		output: 'no-schema',
		system: IMPORT_RESUME_SYSTEM,
		prompt: fileText,
		onFinish: async ({ usage, object: extractedObject }) => {
			const durationMs = Date.now() - startTime;
			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'import-resume',
						providerId,
						model: modelName,
						tokensIn: usage.inputTokens ?? null,
						tokensOut: usage.outputTokens ?? null,
						durationMs,
						error: null,
					},
				});
			} catch (logErr) {
				console.error('Failed to log AI call:', logErr);
			}

			if (extractedObject) {
				const obj = extractedObject as Record<string, unknown>;
				const companies = (obj.workCompanies as unknown[])?.length ?? 0;
				const edu = (obj.educations as unknown[])?.length ?? 0;
				const skills = (obj.skills as unknown[])?.length ?? 0;
				console.log(`[import-resume] Extracted: ${companies} companies, ${edu} educations, ${skills} skills`);
			}
		},
		onError: async (err) => {
			const durationMs = Date.now() - startTime;
			try {
				await db.aiCallLog.create({
					data: {
						userId,
						operation: 'import-resume',
						providerId,
						model: modelName,
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
