import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';
import { logout } from './session.service';

describe('logout', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    useSupporterRegisterStore.setState({ step: 2, formData: { fullName: 'Bia' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ends the session in the BFF and then clears the user stores', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    await logout();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' })
    );
    expect(useSupporterRegisterStore.getState()).toMatchObject({ step: 1, formData: {} });
  });

  it('keeps the stores when the BFF fails, since the cookies are still set', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ message: 'falhou' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(logout()).rejects.toBeInstanceOf(ApiError);
    expect(useSupporterRegisterStore.getState().step).toBe(2);
  });
});
