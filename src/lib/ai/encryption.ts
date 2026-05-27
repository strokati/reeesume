import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.AUTH_MODE === 'none') {
      return scryptSync('local-user-encryption-key', 'masterresume-salt', KEY_LENGTH);
    }
    throw new Error('NEXTAUTH_SECRET is required for API key encryption');
  }
  return scryptSync(secret, 'masterresume-salt', KEY_LENGTH);
}

export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.alloc(IV_LENGTH);
  crypto.getRandomValues(iv);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptApiKey(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, 'base64');

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

export function maskApiKey(apiKey: string | null): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '••••';
  return apiKey.slice(0, 3) + '...' + apiKey.slice(-4);
}
