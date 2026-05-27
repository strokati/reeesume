import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import {
  buildAnalyzeVacancySystem,
  analyzeVacancyPrompt,
  summarizeMasterResume,
} from '@/lib/ai/prompts/analyze-vacancy';
import { getFullMasterResume } from '@/server/queries/master-resume';
import { db } from '@/lib/db/client';

export async function analyzeVacancy(userId: string, applicationId: string, providerId: string) {
  const startTime = Date.now();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { vacancy: true, masterResume: { select: { language: true } } },
  });

  if (!application || !application.vacancy.rawText) {
    throw new Error('Application not found or vacancy has no text to analyze.');
  }

  const language = application.masterResume?.language ?? 'en';
  const fullResume = await getFullMasterResume(userId, application.masterResumeId);
  const resumeSummary = summarizeMasterResume(
    fullResume as unknown as Parameters<typeof summarizeMasterResume>[0]
  );

  const { model, modelName } = await getProviderForUser(userId, providerId);

  const result = streamText({
    model,
    system: buildAnalyzeVacancySystem(language),
    prompt: analyzeVacancyPrompt(application.vacancy.rawText, resumeSummary),
    onFinish: async (event) => {
      const durationMs = Date.now() - startTime;
      const usage = event.totalUsage;

      try {
        await db.aiCallLog.create({
          data: {
            userId,
            operation: 'analyze-vacancy',
            providerId,
            model: modelName,
            applicationId,
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
            await db.vacancy.update({
              where: { id: application.vacancyId },
              data: { aiAnalysis: json },
            });
          } catch {
            await db.vacancy.update({
              where: { id: application.vacancyId },
              data: { aiAnalysis: { raw: text } },
            });
          }
        }
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
            operation: 'analyze-vacancy',
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
