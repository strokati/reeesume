import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

describe('NEXTAUTH_SECRET boot guard', () => {
  const original = process.env.NEXTAUTH_SECRET;
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.AUTH_SECRET;
    warnSpy.mockClear();
  });

  afterEach(() => {
    if (original !== undefined) process.env.NEXTAUTH_SECRET = original;
  });

  it('throws when NEXTAUTH_SECRET is the documented placeholder', async () => {
    process.env.NEXTAUTH_SECRET = 'change-me-in-production';
    await expect(import('@/lib/auth/config')).rejects.toThrow(/NEXTAUTH_SECRET/);
  });

  it('throws when NEXTAUTH_SECRET is empty', async () => {
    process.env.NEXTAUTH_SECRET = '';
    await expect(import('@/lib/auth/config')).rejects.toThrow(/NEXTAUTH_SECRET/);
  });

  it('throws when NEXTAUTH_SECRET is missing entirely', async () => {
    await expect(import('@/lib/auth/config')).rejects.toThrow(/NEXTAUTH_SECRET/);
  });

  it('throws on common low-effort placeholders', async () => {
    for (const ph of ['placeholder', 'changeme', 'secret']) {
      process.env.NEXTAUTH_SECRET = ph;
      await expect(import('@/lib/auth/config')).rejects.toThrow(/NEXTAUTH_SECRET/);
      vi.resetModules();
    }
  });

  it('warns but does not throw when secret is shorter than 32 chars', async () => {
    process.env.NEXTAUTH_SECRET = 'a'.repeat(16);
    await expect(import('@/lib/auth/config')).resolves.toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/shorter than 32 chars/));
  });

  it('passes silently with a 32-char secret', async () => {
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32);
    await expect(import('@/lib/auth/config')).resolves.toBeDefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
