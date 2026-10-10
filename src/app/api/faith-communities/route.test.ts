import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api/backend', () => ({
  BackendApiError: class BackendApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body?: unknown
    ) {
      super(message);
    }
  },
  backendFetch: vi.fn(),
}));

import { backendFetch } from '@/lib/api/backend';
import { GET } from './route';

describe('GET /api/faith-communities', () => {
  beforeEach(() => {
    vi.mocked(backendFetch).mockReset();
  });

  it('forwards the catalog from the backend', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: [{ id: 'community-1', name: 'Igreja Batista' }],
    });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'community-1', name: 'Igreja Batista' }],
    });
  });

  it('returns 502 when the backend is unreachable', async () => {
    vi.mocked(backendFetch).mockRejectedValue(new Error('ECONNREFUSED'));

    const response = await GET();
    expect(response.status).toBe(502);
  });
});
