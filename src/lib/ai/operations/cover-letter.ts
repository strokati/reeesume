import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import { type CoverLetterTone, TONE_INSTRUCTIONS } from '@/lib/ai/prompts/cover-letter';
import { resolvePrompt } from '@/lib/ai/prompts/defaults';
import { languageLabel } from '@/lib/utils/language';
import { getFullMasterResume } from '@/server/queries/master-resume';
import { summarizeMasterResume } from '@/lib/ai/prompts/analyze-vacancy';
import { resumeContentToText } from '@/lib/ai/prompts/ats-check';
import { db } from '@/lib/db/client';

export async function generateCoverLetter(
  userId: string,
  applicationId: string,
  tone: CoverLetterTone,
  providerId: string
) {
  const startTime = Date.now();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      vacancy: true,
      masterResume: { select: { language: true } },
      resumeDrafts: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!application || !application.vacancy) {
    throw new Error('Application or vacancy not found.');
  }

  if (!application.vacancy.rawText) {
    throw new Error('No job posting text available.');
  }

  const language = application.masterResume?.language ?? 'en';
  const fullResume = await getFullMasterResume(userId, application.masterResumeId);
  const resumeSummary = summarizeMasterResume(
    fullResume as unknown as Parameters<typeof summarizeMasterResume>[0]
  );

  const activeDraft = application.resumeDrafts[0];
  const resumeText = activeDraft?.content
    ? resumeContentToText(activeDraft.content)
    : resumeSummary;

  const contactInfo = (fullResume as { contactInfo?: unknown }).contactInfo as Record<
    string,
    unknown
  > | null;
  const contactName = (contactInfo?.name as string) || 'Candidate';

  const { model, modelName } = await getProviderForUser(userId, providerId);

  const langLabel = languageLabel(language);
  const marketRules =
    language === 'de'
      ? `### German ("de") Market Rules
- Use formal "Sie" address consistently throughout. Never "du".
- Structure: Betreff line → formal greeting (Sehr geehrte/r [Name], or Sehr geehrte Damen und Herren,) → Einleitung → Hauptteil (2–3 Absätze) → Schluss → formal closing (Mit freundlichen Grüßen).
- German cover letters are more formal and structured than English ones — minimize colloquial phrasing.
- Tone mapping: "professional" = sachlich und präzise, "confident" = selbstbewusst und direkt, "warm" = persönlich aber professionell.
- Strict 1-page maximum — this is a firm convention in German-speaking markets (DE, AT, CH).
- Avoid Anglo-American opening styles ("I am thrilled to...") — begin with a direct, confident statement of purpose.`
      : language === 'en'
        ? `### English ("en") Market Rules
- Use the hiring manager's name when available; avoid "To Whom It May Concern".
- Standard structure: greeting → opening hook → 2–3 body paragraphs → closing + CTA.
- Tone options as defined in the system prompt.
- British English ("en-GB"): more restrained and formal. American English ("en-US"): slightly warmer and more direct. Match the company's country of origin when detectable.`
        : '';

  const system = await resolvePrompt(
    'cover-letter.system',
    { languageLabel: langLabel, language, marketRules },
    userId
  );
  const prompt = await resolvePrompt(
    'cover-letter.user',
    {
      contactName,
      companyName: application.vacancy.companyName,
      jobTitle: application.vacancy.jobTitle,
      tone,
      toneInstructions: TONE_INSTRUCTIONS[tone],
      resumeText,
      vacancyText: application.vacancy.rawText,
    },
    userId
  );

  const result = streamText({
    model,
    system,
    prompt,
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
