import { describe, it, expect, vi } from 'vitest';
import { getProviderForUser } from '../providers';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});

// Stub the decryption layer so we don't need a real NEXTAUTH_SECRET in CI.
vi.mock('@/lib/ai/encryption', () => ({
  decryptApiKey: (ciphertext: string) => `decrypted-${ciphertext}`,
  encryptApiKey: (plain: string) => `encrypted-${plain}`,
  maskApiKey: (key: string | null) => key ?? '',
}));

const SENSITIVE_ENV_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'MISTRAL_API_KEY',
  'GROQ_API_KEY',
  'XAI_API_KEY',
  'DEEPSEEK_API_KEY',
] as const;

describe('getProviderForUser — API key handling', () => {
  it('does not write decrypted API keys to process.env', async () => {
    // Snapshot env state before the call.
    const before: Record<string, string | undefined> = {};
    for (const k of SENSITIVE_ENV_KEYS) before[k] = process.env[k];

    db.aiProviderConfig.findUnique.mockResolvedValue({
      id: 'cfg-1',
      userId: 'user-1',
      providerId: 'openai',
      apiKey: 'encrypted-blob',
      model: 'gpt-4o-mini',
      isDefault: false,
      baseUrl: null,
      displayName: null,
      apiMode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await getProviderForUser('user-1', 'openai').catch(() => {
      // createOpenAI may fail in jsdom; we only care about the env side effect.
    });

    for (const k of SENSITIVE_ENV_KEYS) {
      expect(process.env[k], `${k} should be unchanged`).toBe(before[k]);
    }
  });
});
