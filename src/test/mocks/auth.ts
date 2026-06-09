import { vi } from 'vitest';

export const mockSession = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
};

export const mockAuth = vi.fn().mockResolvedValue(mockSession);

vi.mock('@/lib/auth/config', () => ({
  auth: mockAuth,
}));
