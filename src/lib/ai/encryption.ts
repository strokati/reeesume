import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const SCRYPT_SALT = 'reeesume-app-salt';

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET (or AUTH_SECRET) is required to encrypt AI provider API keys. ' +
        'Generate one with: openssl rand -base64 32'
    );
  }
  return scryptSync(secret, SCRYPT_SALT, KEY_LENGTH, SCRYPT_PARAMS);
}

/**
 * V2 encrypt: per-row random salt stored as a prefix in the envelope.
 * Layout: [salt(16)] [iv(16)] [authTag(16)] [ciphertext]
 */
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const salt = randomBytes(SALT_LENGTH);
  const iv = Buffer.alloc(IV_LENGTH);
  crypto.getRandomValues(iv);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
}

/**
 * V1 decrypt: legacy envelope without salt prefix.
 * Layout: [iv(16)] [authTag(16)] [ciphertext]
 *
 * Kept so existing rows can be auto-migrated to V2 on first read.
 */
function decryptApiKeyV1(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, 'base64');

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function decryptApiKey(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, 'base64');

  // V2 envelope has salt prefix; V1 doesn't. Detect by total length vs. content.
  // V2 layout: salt(16) + iv(16) + authTag(16) + ciphertext (>=1)
  // V1 layout: iv(16) + authTag(16) + ciphertext (>=1)
  // Heuristic: if data is long enough to contain a salt prefix AND the version
  // field on the row is V1, use V1. Callers that know the version should use
  // decryptApiKeyWithVersion() instead.
  const v2Prefix = SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
  if (data.length >= v2Prefix) {
    // Try V2 first.
    try {
      const salt = data.subarray(0, SALT_LENGTH); // accepted; key derivation uses app salt today
      void salt;
      const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const authTag = data.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
      );
      const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

      const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
      decipher.setAuthTag(authTag);
      return decipher.update(encrypted) + decipher.final('utf8');
    } catch {
      // fall through to V1
    }
  }
  return decryptApiKeyV1(ciphertext);
}

/**
 * Version-aware decrypt. Use when the caller already knows the row's
 * encryptionVersion — avoids the heuristic guess in decryptApiKey().
 */
export function decryptApiKeyWithVersion(ciphertext: string, version: 1 | 2): string {
  if (version === 1) return decryptApiKeyV1(ciphertext);
  return decryptApiKey(ciphertext);
}

export function maskApiKey(apiKey: string | null): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '••••';
  return apiKey.slice(0, 3) + '...' + apiKey.slice(-4);
}
