import crypto from 'crypto';
import { db } from '@/lib/db/client';

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

  if (!otp) return false;

  await db.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return true;
}
