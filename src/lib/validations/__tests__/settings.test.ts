import { describe, it, expect } from 'vitest';
import { UpsertAiProviderSchema } from '@/lib/validations/settings';

describe('UpsertAiProviderSchema', () => {
  it('accepts valid provider with apiKey and model', () => {
    const result = UpsertAiProviderSchema.safeParse({
      providerId: 'openai',
      apiKey: 'sk-test-key',
      model: 'gpt-4o',
    });
    expect(result.success).toBe(true);
  });

  it('accepts provider without apiKey (e.g., ollama)', () => {
    const result = UpsertAiProviderSchema.safeParse({
      providerId: 'ollama',
      model: 'llama3',
      baseUrl: 'http://localhost:11434',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing providerId', () => {
    const result = UpsertAiProviderSchema.safeParse({
      apiKey: 'key',
      model: 'gpt-4o',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('providerId');
  });

  it('rejects missing model', () => {
    const result = UpsertAiProviderSchema.safeParse({
      providerId: 'openai',
      apiKey: 'key',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toContain('model');
  });

  it('accepts valid baseUrl', () => {
    const result = UpsertAiProviderSchema.safeParse({
      providerId: 'custom',
      model: 'model-1',
      baseUrl: 'https://api.example.com/v1',
    });
    expect(result.success).toBe(true);
  });
});
