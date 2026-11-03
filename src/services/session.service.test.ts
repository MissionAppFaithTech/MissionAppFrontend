import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logoutAction } from '@/app/actions/auth';
import { ApiError } from '@/lib/api/client';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';
import { logout } from './session.service';

vi.mock('@/app/actions/auth', () => ({ logoutAction: vi.fn() }));

describe('logout', () => {
  beforeEach(() => {
    vi.mocked(logoutAction).mockReset();
    useSupporterRegisterStore.setState({ step: 2, formData: { fullName: 'Bia' } });
  });

  it('ends the session on the server and then clears the user stores', async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      ok: true,
      data: { message: 'Você saiu da sua conta.' },
    });

    await logout();

    expect(logoutAction).toHaveBeenCalledTimes(1);
    expect(useSupporterRegisterStore.getState()).toMatchObject({ step: 1, formData: {} });
  });

  it('keeps the stores when the request fails, since the cookies are still set', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(logoutAction).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(logout()).rejects.toBeInstanceOf(ApiError);
    expect(useSupporterRegisterStore.getState().step).toBe(2);
    vi.mocked(console.error).mockRestore();
  });
});
