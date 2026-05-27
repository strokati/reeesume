import { db } from '@/lib/db/client';
import { maskApiKey } from '@/lib/ai/encryption';

export async function getAiProviderConfigs(userId: string) {
  const configs = await db.aiProviderConfig.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { providerId: 'asc' }],
  });
  return configs.map((c) => ({
    ...c,
    apiKey: maskApiKey(c.apiKey),
  }));
}

export async function getDefaultAiProvider(userId: string) {
  const config = await db.aiProviderConfig.findFirst({
    where: { userId, isDefault: true },
  });
  if (!config) return null;
  return { ...config, apiKey: maskApiKey(config.apiKey) };
}
