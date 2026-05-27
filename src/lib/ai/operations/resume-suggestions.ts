import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import {
  buildResumeSuggestionsSystem,
  buildResumeSuggestionsPrompt,
} from '@/lib/ai/prompts/resume-suggestions';
import { summarizeMasterResume } from '@/lib/ai/prompts/analyze-vacancy';
import { getFullMasterResume } from '@/server/queries/master-resume';
import { db } from '@/lib/db/client';

export async function getResumeSuggestions(
  userId: string,
  applicationId: string,
  providerId: string
) {
  const startTime = Date.now();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { vacancy: true, masterResume: { select: { language: true } } },
  });

  if (!application || !application.vacancy) {
    throw new Error('Application or vacancy not found.');
  }

  if (!application.vacancy.rawText) {
    throw new Error('No job posting text to analyze.');
  }

  const language = application.masterResume?.language ?? 'en';
  const fullResume = await getFullMasterResume(userId, application.masterResumeId);

  const workItems = (fullResume.workCompanies ?? []).flatMap((c) =>
    c.roles.map((r) => ({
      companyId: c.id,
      companyName: c.name,
      roleId: r.id,
      roleTitle: r.title,
      responsibilities: (r.responsibilities as string[] | null) ?? undefined,
      achievements: (r.achievements as string[] | null) ?? undefined,
    }))
  );

  const skillItems = (fullResume.skills ?? []).map((s) => ({
    skillId: s.id,
    name: s.name,
    category: s.category,
  }));

  const projectItems = (fullResume.projects ?? []).map((p) => ({
    projectId: p.id,
    name: p.name,
    description: p.description,
    technologies: (p.technologies as string[] | null) ?? undefined,
  }));

  const resumeSummary = summarizeMasterResume(
    fullResume as unknown as Parameters<typeof summarizeMasterResume>[0]
  );

  const prompt = buildResumeSuggestionsPrompt({
    vacancyText: application.vacancy.rawText,
    vacancyAnalysis: application.vacancy.aiAnalysis,
    masterResumeSummary: resumeSummary,
    workItems,
    skillItems,
    projectItems,
  });

  const { model, modelName } = await getProviderForUser(userId, providerId);

  const result = streamText({
    model,
    system: buildResumeSuggestionsSystem(language),
    prompt,
    onFinish: async (event) => {
      const durationMs = Date.now() - startTime;
      const usage = event.totalUsage;
      try {
        await db.aiCallLog.create({
          data: {
            userId,
            operation: 'resume-suggestions',
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
            operation: 'resume-suggestions',
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
