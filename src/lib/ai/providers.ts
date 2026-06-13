import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { createXai } from '@ai-sdk/xai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { db } from '@/lib/db/client';
import { decryptApiKey } from '@/lib/ai/encryption';
import type { LanguageModel } from 'ai';

type ProviderConfig = {
  providerId: string;
  model: string;
  baseUrl?: string | null;
  apiKey?: string;
};

export async function getProvider(config: ProviderConfig): Promise<LanguageModel> {
  const { providerId, model, baseUrl, apiKey } = config;

  switch (providerId) {
    case 'openai':
      return createOpenAI()(model);
    case 'anthropic':
      return createAnthropic()(model);
    case 'google':
      return createGoogleGenerativeAI()(model);
    case 'mistral':
      return createMistral()(model);
    case 'groq':
      return createGroq()(model);
    case 'xai':
      return createXai()(model);
    case 'zai':
      return createOpenAI({
        baseURL: baseUrl || 'https://api.z.ai/api/paas/v4/',
        apiKey: apiKey || process.env.ZAI_API_KEY,
      })(model);
    case 'deepseek':
      return createDeepSeek()(model);
    case 'ollama':
      return createOpenAI({
        baseURL: baseUrl || 'http://localhost:11434/v1',
        apiKey: 'ollama',
      })(model);
    case 'custom':
      return createOpenAI({
        baseURL: baseUrl || undefined,
        apiKey: 'custom',
      })(model);
    default:
      throw new Error(`Unknown AI provider: ${providerId}`);
  }
}

export async function getProviderForUser(
  userId: string,
  providerId: string
): Promise<{ model: LanguageModel; modelName: string; providerId: string }> {
  const config = await db.aiProviderConfig.findUnique({
    where: { userId_providerId: { userId, providerId } },
  });

  if (!config || !config.apiKey) {
    throw new Error(`AI provider "${providerId}" is not configured. Set it up in Settings.`);
  }

  const apiKey = decryptApiKey(config.apiKey);

  // Temporarily set env var so the SDK factory picks it up
  const envKeyMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    groq: 'GROQ_API_KEY',
    xai: 'XAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
  };
  const envKey = envKeyMap[providerId];
  if (envKey) {
    process.env[envKey] = apiKey;
  }

  const model = await getProvider({
    providerId,
    model: config.model,
    baseUrl: config.baseUrl,
    apiKey: providerId === 'zai' ? apiKey : undefined,
  });

  return { model, modelName: config.model, providerId };
}

export async function getDefaultProviderForUser(userId: string) {
  const config = await db.aiProviderConfig.findFirst({
    where: { userId, isDefault: true },
  });
  if (!config) {
    throw new Error('No default AI provider configured. Set one up in Settings.');
  }
  return getProviderForUser(userId, config.providerId);
}
