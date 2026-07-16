import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});

import { checkAndIncrement, cleanupExpiredRateLimits } from '../rate-limit';

describe('checkAndIncrement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows the first request and creates a bucket', async () => {
    db.rateLimit.upsert.mockResolvedValue({
      id: '1',
      key: 'k',
      count: 1,
      windowStart: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });

    const ok = await checkAndIncrement('k', { max: 5, windowMs: 60000 });
    expect(ok).toBe(true);
    expect(db.rateLimit.upsert).toHaveBeenCalled();
  });

  it('blocks once max is reached', async () => {
    db.rateLimit.upsert.mockResolvedValue({
      id: '1',
      key: 'k',
      count: 5,
      windowStart: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });

    const ok = await checkAndIncrement('k', { max: 5, windowMs: 60000 });
    expect(ok).toBe(false);
    expect(db.rateLimit.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ count: { increment: 1 } }) })
    );
  });

  it('allows the 4th request when max is 5', async () => {
    db.rateLimit.upsert.mockResolvedValue({
      id: '1',
      key: 'k',
      count: 4,
      windowStart: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });

    const ok = await checkAndIncrement('k', { max: 5, windowMs: 60000 });
    expect(ok).toBe(true);
    expect(db.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { count: { increment: 1 } } })
    );
  });

  it('resets when window has expired', async () => {
    const staleWindowStart = new Date(Date.now() - 2 * 60_000); // older than the 60s window
    db.rateLimit.upsert.mockResolvedValue({
      id: '1',
      key: 'k',
      count: 99,
      windowStart: staleWindowStart,
      expiresAt: new Date(Date.now() - 1000),
    });

    const ok = await checkAndIncrement('k', { max: 5, windowMs: 60_000 });
    expect(ok).toBe(true);
    expect(db.rateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ count: 1 }),
      })
    );
  });
});

describe('cleanupExpiredRateLimits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no-ops when random > probability', async () => {
    await cleanupExpiredRateLimits(0); // probability 0 → never runs
    expect(db.rateLimit.deleteMany).not.toHaveBeenCalled();
  });

  it('deletes expired rows when probability hits', async () => {
    db.rateLimit.deleteMany.mockResolvedValue({ count: 3 });
    await cleanupExpiredRateLimits(1); // probability 1 → always runs
    expect(db.rateLimit.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { expiresAt: expect.objectContaining({ lt: expect.any(Date) }) },
      })
    );
  });

  it('swallows DB errors', async () => {
    db.rateLimit.deleteMany.mockRejectedValue(new Error('network'));
    await expect(cleanupExpiredRateLimits(1)).resolves.toBeUndefined();
  });
});
