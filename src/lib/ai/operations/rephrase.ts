import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';
import { buildRephrasePrompt, type RephraseDirection } from '@/lib/ai/prompts/rephrase';
import { db } from '@/lib/db/client';

export async function rephraseBullet(
  original: string,
  direction: RephraseDirection,
  context: string,
  providerId: string,
  userId: string,
  language?: string
) {
  const startTime = Date.now();
  const { model, modelName } = await getProviderForUser(userId, providerId);

  const result = streamText({
    model,
    prompt: buildRephrasePrompt(original, direction, context, language),
    onFinish: async (event) => {
      const durationMs = Date.now() - startTime;
      const usage = event.totalUsage;
      try {
        await db.aiCallLog.create({
          data: {
            userId,
            operation: 'rephrase',
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
    },
    onError: async (err) => {
      const durationMs = Date.now() - startTime;
      try {
        await db.aiCallLog.create({
          data: {
            userId,
            operation: 'rephrase',
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
