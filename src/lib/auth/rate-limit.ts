import { db } from '@/lib/db/client';

type Limit = { max: number; windowMs: number };

/**
 * Atomic upsert that increments a per-key counter, resetting when the window
 * has rolled past. Returns false when the limit has been exceeded — callers
 * should respond with a 429 / friendly error rather than performing the
 * protected action.
 *
 * Buckets are coarse: any call within the same `windowMs` counts. A periodic
 * cleanup pass (or the small inline cleanup below) reaps expired rows.
 */
export async function checkAndIncrement(key: string, limit: Limit): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - limit.windowMs);
  const expiresAt = new Date(now.getTime() + limit.windowMs);

  const row = await db.rateLimit.upsert({
    where: { key },
    create: { key, count: 1, windowStart: now, expiresAt },
    update: {},
  });

  // Window expired → reset.
  if (row.windowStart < windowStart) {
    await db.rateLimit.update({
      where: { key },
      data: { count: 1, windowStart: now, expiresAt },
    });
    return true;
  }

  if (row.count >= limit.max) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

/**
 * Opportunistic cleanup — call from a hot path (e.g. inside verifyOtp) with
 * small probability to keep the rate_limits table from growing unbounded
 * without adding a cron.
 */
export async function cleanupExpiredRateLimits(probability = 0.01): Promise<void> {
  if (Math.random() > probability) return;
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {
    /* best-effort */
  });
}
