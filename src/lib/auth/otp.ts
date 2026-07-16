import crypto from 'crypto';
import { db } from '@/lib/db/client';
import { cleanupExpiredRateLimits } from './rate-limit';

const MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const otp = await db.otpCode.findFirst({
    where: {
      userId,
      hashedCode,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (otp) {
    await cleanupExpiredRateLimits();
    await db.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });
    return true;
  }

  // Wrong code — bump the attempt counter on the most recent unused code for
  // this user. After MAX_ATTEMPTS, the code is burned even if later guesses
  // would have been correct.
  const latest = await db.otpCode.findFirst({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (latest) {
    const nextAttempts = (latest.attempts ?? 0) + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      await db.otpCode.update({
        where: { id: latest.id },
        data: { usedAt: new Date(), attempts: nextAttempts },
      });
    } else {
      await db.otpCode.update({
        where: { id: latest.id },
        data: { attempts: nextAttempts },
      });
    }
  }

  return false;
}
