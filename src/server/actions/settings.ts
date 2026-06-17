'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db/client';
import { encryptApiKey } from '@/lib/ai/encryption';
import { UpsertAiProviderSchema } from '@/lib/validations/settings';
import type { UpsertAiProviderInput } from '@/lib/validations/settings';

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session && process.env.AUTH_MODE === 'email_otp') redirect('/login');
  return session?.user?.id ?? 'local-user';
}

export async function upsertAiProviderConfig(data: UpsertAiProviderInput): Promise<void> {
  const userId = await requireAuth();
  const validated = UpsertAiProviderSchema.parse(data);

  const updateData: Record<string, unknown> = {
    model: validated.model,
    baseUrl: validated.baseUrl || null,
    displayName: validated.displayName || null,
    apiMode: validated.apiMode ?? null,
  };

  if (validated.apiKey) {
    updateData.apiKey = encryptApiKey(validated.apiKey);
  }

  try {
    await db.aiProviderConfig.upsert({
      where: { userId_providerId: { userId, providerId: validated.providerId } },
      create: {
        userId,
        providerId: validated.providerId,
        apiKey: validated.apiKey ? encryptApiKey(validated.apiKey) : null,
        model: validated.model,
        baseUrl: validated.baseUrl || null,
        displayName: validated.displayName || null,
        apiMode: validated.apiMode ?? null,
      },
      update: updateData,
    });
  } catch {
    throw new Error('Failed to save provider configuration.');
  }
  revalidatePath('/settings');
}

export async function deleteAiProviderConfig(providerId: string): Promise<void> {
  const userId = await requireAuth();
  try {
    await db.aiProviderConfig.delete({
      where: { userId_providerId: { userId, providerId } },
    });
  } catch {
    throw new Error('Failed to delete provider configuration.');
  }
  revalidatePath('/settings');
}

export async function setDefaultAiProvider(providerId: string): Promise<void> {
  const userId = await requireAuth();
  try {
    await db.$transaction([
      db.aiProviderConfig.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      db.aiProviderConfig.update({
        where: { userId_providerId: { userId, providerId } },
        data: { isDefault: true },
      }),
    ]);
  } catch {
    throw new Error('Failed to set default provider.');
  }
  revalidatePath('/settings');
}

export async function testAiConnection(
  providerId: string,
  overrides?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    apiMode?: 'openai' | 'anthropic';
  }
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireAuth();

  let apiKey: string;
  let model: string;
  let baseUrl: string | null = null;
  let apiMode: 'openai' | 'anthropic' | null = null;

  if (overrides?.apiKey && overrides?.model) {
    apiKey = overrides.apiKey;
    model = overrides.model;
    baseUrl = overrides.baseUrl ?? null;
    apiMode = overrides.apiMode ?? null;
  } else {
    const config = await db.aiProviderConfig.findUnique({
      where: { userId_providerId: { userId, providerId } },
    });
    if (!config || !config.apiKey) {
      return { success: false, error: 'Provider not configured or API key missing.' };
    }
    const { decryptApiKey } = await import('@/lib/ai/encryption');
    apiKey = decryptApiKey(config.apiKey);
    model = config.model;
    baseUrl = config.baseUrl;
    apiMode = (config.apiMode as 'openai' | 'anthropic' | null) ?? null;
  }

  const { getProvider } = await import('@/lib/ai/providers');
  const { generateText } = await import('ai');

  try {
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
    if (envKey) process.env[envKey] = apiKey;

    const aiModel = await getProvider({
      providerId,
      model,
      baseUrl,
      apiKey: providerId === 'zai' ? apiKey : undefined,
      apiMode: providerId === 'zai' ? apiMode : null,
    });

    await generateText({ model: aiModel, prompt: 'Say "ok" in one word.' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed.' };
  }
}
