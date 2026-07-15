import crypto from 'crypto';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Nodemailer from 'next-auth/providers/nodemailer';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db/client';
import { generateOtp } from './otp';

const PLACEHOLDER_SECRETS = new Set([
  'change-me-in-production',
  'placeholder',
  'changeme',
  'secret',
  '',
]);

function assertNextauthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret || PLACEHOLDER_SECRETS.has(secret.trim().toLowerCase())) {
    throw new Error(
      '[boot] NEXTAUTH_SECRET is missing or placeholder. Generate one with:\n' +
        '  openssl rand -base64 32\n' +
        'Then set it in your .env (or docker-compose env).'
    );
  }
  if (secret.length < 32) {
    console.warn(
      `[boot] NEXTAUTH_SECRET is shorter than 32 chars (got ${secret.length}). ` +
        'Recommend regenerating with: openssl rand -base64 32'
    );
  }
}

assertNextauthSecret();

const authMode = process.env.AUTH_MODE ?? 'none';

const emailOtpConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
      sendVerificationRequest: async ({ identifier: email }: { identifier: string }) => {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return;

        const code = generateOtp();
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        await db.otpCode.create({
          data: {
            userId: user.id,
            hashedCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? '587'),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM ?? 'noreply@example.com',
          to: email,
          subject: 'Your verification code',
          text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        });
      },
    }),
  ],
  session: {
    strategy: 'database' as const,
    maxAge: Number(process.env.SESSION_DURATION_DAYS ?? 30) * 86400,
  },
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      if (user.email && user.email !== process.env.ALLOWED_EMAIL) {
        return false;
      }
      return true;
    },
  },
};

export const authConfig = authMode === 'email_otp' ? emailOtpConfig : {};

const nextAuthResult = authMode === 'email_otp' ? NextAuth(emailOtpConfig) : null;

export const auth = nextAuthResult ? nextAuthResult.auth : async () => null;

export const handlers = nextAuthResult
  ? nextAuthResult.handlers
  : {
      GET: async () => new Response('Auth disabled', { status: 404 }),
      POST: async () => new Response('Auth disabled', { status: 404 }),
    };
