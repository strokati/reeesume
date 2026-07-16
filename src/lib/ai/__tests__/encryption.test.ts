import { describe, it, expect, beforeAll } from 'vitest';
import { scryptSync, createCipheriv, getRandomValues } from 'node:crypto';
import {
  encryptApiKey,
  decryptApiKey,
  decryptApiKeyWithVersion,
  maskApiKey,
} from '@/lib/ai/encryption';

beforeAll(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-32-chars-or-longer-aaaa-bbbb';
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

describe('V1 / V2 compatibility', () => {
  // V1 envelope: [iv(16)] [authTag(16)] [ciphertext] — no per-row salt.
  // Reproduce by encrypting with the V1 layout (no salt prefix).
  function encryptV1(plaintext: string): string {
    const ALGORITHM = 'aes-256-gcm';
    const KEY_LENGTH = 32;
    const IV_LENGTH = 16;
    const AUTH_TAG_LENGTH = 16;
    const key = scryptSync(process.env.NEXTAUTH_SECRET!, 'reeesume-app-salt', KEY_LENGTH, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });
    const iv = Buffer.alloc(IV_LENGTH);
    getRandomValues(iv);
    const cipher = createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  it('decryptApiKeyWithVersion decrypts a V1 blob with version=1', () => {
    const v1 = encryptV1('sk-legacy-key');
    expect(decryptApiKeyWithVersion(v1, 1)).toBe('sk-legacy-key');
  });

  it('decryptApiKeyWithVersion decrypts a V2 blob with version=2', () => {
    const v2 = encryptApiKey('sk-modern-key');
    expect(decryptApiKeyWithVersion(v2, 2)).toBe('sk-modern-key');
  });

  it('decryptApiKey() auto-detects V2 envelopes', () => {
    const v2 = encryptApiKey('sk-auto-key');
    expect(decryptApiKey(v2)).toBe('sk-auto-key');
  });

  it('V2 ciphertext length is at least 16 bytes longer than V1 (salt prefix)', () => {
    const v1 = encryptV1('same-key');
    const v2 = encryptApiKey('same-key');
    const v1Bytes = Buffer.from(v1, 'base64').length;
    const v2Bytes = Buffer.from(v2, 'base64').length;
    expect(v2Bytes - v1Bytes).toBeGreaterThanOrEqual(16);
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
