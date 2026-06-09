/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeRenderData, consumeRenderData } from '@/lib/export/render-store';

const mockData = { contactInfo: { name: 'Test User' } } as any;

describe('render-store', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('stores data and returns a token string', () => {
    const token = storeRenderData(mockData, 'ats-simple');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('consumeRenderData returns the stored entry', () => {
    const token = storeRenderData(mockData, 'ats-simple');
    const entry = consumeRenderData(token);
    expect(entry).not.toBeNull();
    expect(entry?.data).toEqual(mockData);
    expect(entry?.templateId).toBe('ats-simple');
  });

  it('token is single-use — second consume returns null', () => {
    const token = storeRenderData(mockData, 'ats-simple');
    consumeRenderData(token);
    const second = consumeRenderData(token);
    expect(second).toBeNull();
  });

  it('returns null for unknown token', () => {
    expect(consumeRenderData('nonexistent-token')).toBeNull();
  });

  it('entry expires after TTL', () => {
    vi.useFakeTimers();
    const token = storeRenderData(mockData, 'ats-simple');
    vi.advanceTimersByTime(61_000);
    const entry = consumeRenderData(token);
    expect(entry).toBeNull();
    vi.useRealTimers();
  });
});
