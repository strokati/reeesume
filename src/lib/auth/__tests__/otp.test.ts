import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});

import { generateOtp, verifyOtp } from '@/lib/auth/otp';
import crypto from 'crypto';

describe('generateOtp', () => {
  it('returns a 6-character string', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
  });

  it('returns only digits', () => {
    const otp = generateOtp();
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('generates different values across calls', () => {
    const otps = new Set(Array.from({ length: 20 }, generateOtp));
    expect(otps.size).toBeGreaterThan(1);
  });
});

describe('verifyOtp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true for a valid unused non-expired OTP', async () => {
    const code = '123456';
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    db.otpCode.findFirst.mockResolvedValue({
      id: 'otp-1',
      hashedCode: hash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    db.otpCode.update.mockResolvedValue({});

    const result = await verifyOtp('user-1', code);
    expect(result).toBe(true);
    expect(db.otpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      })
    );
  });

  it('returns false when OTP is expired', async () => {
    const code = '123456';

    db.otpCode.findFirst.mockResolvedValue(null);

    const result = await verifyOtp('user-1', code);
    expect(result).toBe(false);
  });

  it('returns false for wrong code', async () => {
    db.otpCode.findFirst.mockResolvedValue(null);
    const result = await verifyOtp('user-1', '000000');
    expect(result).toBe(false);
  });

  it('returns false and does not update when OTP not found', async () => {
    db.otpCode.findFirst.mockResolvedValue(null);
    await verifyOtp('user-1', '999999');
    expect(db.otpCode.update).not.toHaveBeenCalled();
  });
});
