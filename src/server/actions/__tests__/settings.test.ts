/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'local-user' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/ai/encryption', () => ({
  encryptApiKey: vi.fn((k) => `encrypted-${k}`),
  decryptApiKey: vi.fn((k) => k.replace('encrypted-', '')),
}));

import { upsertAiProviderConfig, deleteAiProviderConfig } from '@/server/actions/settings';
import { revalidatePath } from 'next/cache';

describe('upsertAiProviderConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates or updates a provider config', async () => {
    db.aiProviderConfig.upsert.mockResolvedValue({});
    await upsertAiProviderConfig({
      providerId: 'openai',
      apiKey: 'sk-test',
      model: 'gpt-4o',
    });
    expect(db.aiProviderConfig.upsert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/settings');
  });

  it('rejects missing providerId', async () => {
    await expect(
      upsertAiProviderConfig({ model: 'gpt-4o', apiKey: 'key' } as any)
    ).rejects.toThrow();
  });
});

describe('deleteAiProviderConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the provider config', async () => {
    db.aiProviderConfig.delete.mockResolvedValue({});
    await deleteAiProviderConfig('openai');
    expect(db.aiProviderConfig.delete).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/settings');
  });
});
