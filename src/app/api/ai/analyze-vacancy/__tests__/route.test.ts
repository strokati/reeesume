import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/test/mocks/db';

vi.mock('@/lib/db/client', async () => {
  const { db } = await import('@/test/mocks/db');
  return { db };
});
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'local-user' },
    expires: new Date(Date.now() + 3600000).toISOString(),
  }),
}));
vi.mock('@/lib/ai/operations/analyze-vacancy', () => ({
  analyzeVacancy: vi.fn().mockResolvedValue({
    toTextStreamResponse: () => new Response('stream', { status: 200 }),
  }),
}));

import { POST } from '@/app/api/ai/analyze-vacancy/route';
import { createPostRequest } from '@/test/helpers/api-route';

describe('POST /api/ai/analyze-vacancy', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when applicationId is missing', async () => {
    const req = createPostRequest('http://localhost/api/ai/analyze-vacancy', {
      providerId: 'openai',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when providerId is missing', async () => {
    const req = createPostRequest('http://localhost/api/ai/analyze-vacancy', {
      applicationId: 'app-1',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when application does not belong to user', async () => {
    db.application.findUnique.mockResolvedValue(null);
    const req = createPostRequest('http://localhost/api/ai/analyze-vacancy', {
      applicationId: 'missing',
      providerId: 'openai',
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 when vacancy has no rawText', async () => {
    db.application.findUnique.mockResolvedValue({
      vacancy: { userId: 'local-user', rawText: null },
    });
    const req = createPostRequest('http://localhost/api/ai/analyze-vacancy', {
      applicationId: 'app-1',
      providerId: 'openai',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with stream for valid request', async () => {
    db.application.findUnique.mockResolvedValue({
      vacancy: { userId: 'local-user', rawText: 'Job posting text...' },
    });
    const req = createPostRequest('http://localhost/api/ai/analyze-vacancy', {
      applicationId: 'app-1',
      providerId: 'openai',
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
