import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Stub every external dependency so importing config.ts doesn't pull in
// next-auth's runtime (which can't resolve next/server under jsdom).
vi.mock('@/lib/db/client', () => ({ db: {} }));
vi.mock('next-auth', () => ({
  default: () => ({
    auth: async () => null,
    handlers: { GET: async () => {}, POST: async () => {} },
  }),
}));
vi.mock('@auth/prisma-adapter', () => ({ PrismaAdapter: () => ({}) }));
vi.mock('next-auth/providers/nodemailer', () => ({
  default: (opts: unknown) => ({ id: 'nodemailer', options: opts }),
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: async () => {} }) },
}));

/**
 * The emailOtpConfig object captures the "from" address at module load time
 * via `process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'noreply@example.com'`.
 * To test all three branches we re-import the module with controlled env.
 */

describe('OTP email From: address', () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    delete process.env.SMTP_FROM;
    delete process.env.EMAIL_FROM;
  });

  afterEach(() => {
    for (const k of Object.keys(process.env)) {
      if (!(k in original)) delete process.env[k];
    }
    Object.assign(process.env, original);
  });

  async function loadFrom() {
    process.env.AUTH_MODE = 'email_otp';
    const mod = await import('@/lib/auth/config');
    const cfg = mod.authConfig as { providers: Array<{ options: { from?: string } }> };
    return cfg.providers[0].options.from;
  }

  it('prefers SMTP_FROM when set', async () => {
    process.env.SMTP_FROM = 'Reeesume <me@smtp.com>';
    process.env.EMAIL_FROM = 'legacy@x.com';
    expect(await loadFrom()).toBe('Reeesume <me@smtp.com>');
  });

  it('falls back to EMAIL_FROM when SMTP_FROM is unset (back-compat)', async () => {
    process.env.EMAIL_FROM = 'legacy@x.com';
    expect(await loadFrom()).toBe('legacy@x.com');
  });

  it('falls back to noreply@example.com when neither is set', async () => {
    expect(await loadFrom()).toBe('noreply@example.com');
  });
});
