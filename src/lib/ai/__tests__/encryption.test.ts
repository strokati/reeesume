import { describe, it, expect, beforeAll } from 'vitest';
import { encryptApiKey, decryptApiKey, maskApiKey } from '@/lib/ai/encryption';

beforeAll(() => {
  process.env.AUTH_MODE = 'none';
});

describe('encryptApiKey', () => {
  it('returns a string different from plaintext', () => {
    const plain = 'sk-test-1234567890';
    const encrypted = encryptApiKey(plain);
    expect(encrypted).not.toBe(plain);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const plain = 'sk-test-key';
    const a = encryptApiKey(plain);
    const b = encryptApiKey(plain);
    expect(a).not.toBe(b);
  });

  it('produces different output for different inputs', () => {
    expect(encryptApiKey('key-a')).not.toBe(encryptApiKey('key-b'));
  });
});

describe('decryptApiKey', () => {
  it('round-trips: decrypt(encrypt(x)) === x', () => {
    const plain = 'sk-proj-abc123xyz';
    expect(decryptApiKey(encryptApiKey(plain))).toBe(plain);
  });

  it('handles long API keys (200+ chars)', () => {
    const plain = 'sk-' + 'a'.repeat(200);
    expect(decryptApiKey(encryptApiKey(plain))).toBe(plain);
  });

  it('handles empty string', () => {
    expect(decryptApiKey(encryptApiKey(''))).toBe('');
  });
});

describe('maskApiKey', () => {
  it('masks middle of a long key', () => {
    const result = maskApiKey('sk-proj-1234567890');
    expect(result).toContain('...');
    expect(result).toMatch(/^sk-/);
    expect(result).toMatch(/7890$/);
  });

  it('returns empty string for null', () => {
    expect(maskApiKey(null)).toBe('');
  });

  it('handles short keys (8 chars or less)', () => {
    expect(maskApiKey('abc')).toBe('••••');
  });

  it('handles exactly 8-char key', () => {
    const result = maskApiKey('sk-12345');
    expect(result).toBe('••••');
  });
});
