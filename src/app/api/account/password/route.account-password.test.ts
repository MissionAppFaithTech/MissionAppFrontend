import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as backendModule from '@/lib/api/backend';
import { PATCH } from './route.account-password';

const mockCookieStore = {
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('PATCH /api/account/password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no access token cookie is present', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirmation: 'NewPassword123!',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is invalid JSON', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    const req = new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: 'invalid-json',
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 when passwords do not match', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    const req = new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirmation: 'Mismatch123!',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(422);
  });

  it('proxies successful PATCH request to backend', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    vi.spyOn(backendModule, 'backendFetch').mockResolvedValue({
      message: 'Password changed successfully',
    });

    const req = new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirmation: 'NewPassword123!',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Password changed successfully');
  });

  it('forwards BackendApiError status and body', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-123' });

    vi.spyOn(backendModule, 'backendFetch').mockRejectedValue(
      new backendModule.BackendApiError('Bad Request', 400, { message: 'Senha atual incorreta' })
    );

    const req = new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirmation: 'NewPassword123!',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Senha atual incorreta');
  });
});
