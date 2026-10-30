import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as backendModule from '@/lib/api/backend';
import { PATCH } from './route.missionary-identity';

const mockCookieStore = {
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('PATCH /api/missionaries/identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no access token cookie is present', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/missionaries/identity', {
      method: 'PATCH',
      body: JSON.stringify({
        identityType: 'CPF',
        identityDocument: '12345678901',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is invalid JSON', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    const req = new Request('http://localhost:3000/api/missionaries/identity', {
      method: 'PATCH',
      body: 'invalid-json',
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 when validation fails', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    const req = new Request('http://localhost:3000/api/missionaries/identity', {
      method: 'PATCH',
      body: JSON.stringify({
        identityType: 'INVALID',
        identityDocument: '',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(422);
  });

  it('proxies successful PATCH request to backend', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    vi.spyOn(backendModule, 'backendFetch').mockResolvedValue({
      data: {
        missionary: {
          id: 'miss-1',
          identityType: 'CPF',
          identityDocument: '12345678901',
        },
      },
    });

    const req = new Request('http://localhost:3000/api/missionaries/identity', {
      method: 'PATCH',
      body: JSON.stringify({
        identityType: 'CPF',
        identityDocument: '12345678901',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.missionary.identityType).toBe('CPF');
  });

  it('forwards BackendApiError status and body', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    vi.spyOn(backendModule, 'backendFetch').mockRejectedValue(
      new backendModule.BackendApiError('Forbidden', 403, { message: 'Acesso negado' })
    );

    const req = new Request('http://localhost:3000/api/missionaries/identity', {
      method: 'PATCH',
      body: JSON.stringify({
        identityType: 'CPF',
        identityDocument: '12345678901',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toBe('Acesso negado');
  });
});
