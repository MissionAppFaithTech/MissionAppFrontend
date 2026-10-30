import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as backendModule from '@/lib/api/backend';
import { GET, DELETE } from './route.auth-sessions';

const mockCookieStore = {
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('/api/auth/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('proxies GET sessions to backend', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'token-123' });

      vi.spyOn(backendModule, 'backendFetch').mockResolvedValue({
        data: [{ id: 'session-1', clientIp: '127.0.0.1' }],
      });

      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
    });

    it('forwards BackendApiError', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'token-123' });

      vi.spyOn(backendModule, 'backendFetch').mockRejectedValue(
        new backendModule.BackendApiError('Unauthorized', 401, { message: 'Token inválido' })
      );

      const res = await GET();
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.message).toBe('Token inválido');
    });
  });

  describe('DELETE', () => {
    it('returns 401 when unauthenticated', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const res = await DELETE();
      expect(res.status).toBe(401);
    });

    it('proxies DELETE sessions to backend', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'token-123' });

      vi.spyOn(backendModule, 'backendFetch').mockResolvedValue({
        message: 'Todas as sessões foram encerradas',
      });

      const res = await DELETE();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('Todas as sessões foram encerradas');
    });
  });
});
