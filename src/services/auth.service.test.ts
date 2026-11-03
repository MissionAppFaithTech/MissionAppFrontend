import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  listActiveSessions,
  login,
  requestPasswordReset,
  getResetTokenStatus,
  resetPassword,
  terminateAllSessions,
} from './auth.service';
import { MOCK_RESET_TOKEN, MOCK_EXPIRED_RESET_TOKEN } from '@/mocks/auth';
import { endAllSessionsAction, loginAction } from '@/app/actions/auth';
import { ApiError } from '@/lib/api/client';

vi.mock('@/app/actions/auth', () => ({
  endAllSessionsAction: vi.fn(),
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
  requestPasswordResetAction: vi.fn(),
  resetPasswordAction: vi.fn(),
}));

describe('auth.service', () => {
  const validUserEmail = 'admin@missionapp.test';

  describe('login', () => {
    it('normalizes the e-mail and returns the user', async () => {
      vi.mocked(loginAction).mockResolvedValue({
        ok: true,
        data: { user: { id: '1', fullName: 'Admin Seed', email: validUserEmail } as never },
      });

      const res = await login({ login: '  Admin@MissionApp.test ', password: 'Password123!' });

      expect(res.user.email).toBe(validUserEmail);
      expect(loginAction).toHaveBeenCalledWith({ login: validUserEmail, password: 'Password123!' });
    });

    it('rejects invalid password or user with the pt-BR message', async () => {
      vi.mocked(loginAction).mockResolvedValue({
        ok: false,
        status: 400,
        message: 'E-mail ou senha inválidos',
        code: 'E_INVALID_CREDENTIALS',
      });

      const error = await login({ login: 'nobody@domain.com', password: 'wrong' }).catch(
        (e: unknown) => e
      );
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ message: 'E-mail ou senha inválidos', status: 400 });
    });
  });

  describe('requestPasswordReset', () => {
    it('returns found: true for existing mock email', async () => {
      const res = await requestPasswordReset({ login: validUserEmail });
      expect(res.found).toBe(true);
      expect(res.resetPath).toBeDefined();
    });

    it('returns found: false for unknown email', async () => {
      const res = await requestPasswordReset({ login: 'nobody@example.com' });
      expect(res.found).toBe(false);
    });
  });

  describe('getResetTokenStatus', () => {
    it('returns invalid for null or empty token', () => {
      expect(getResetTokenStatus(null)).toBe('invalid');
      expect(getResetTokenStatus('')).toBe('invalid');
    });

    it('returns valid for MOCK_RESET_TOKEN', () => {
      expect(getResetTokenStatus(MOCK_RESET_TOKEN)).toBe('valid');
    });

    it('returns expired for MOCK_EXPIRED_RESET_TOKEN', () => {
      expect(getResetTokenStatus(MOCK_EXPIRED_RESET_TOKEN)).toBe('expired');
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password with matching passwords and valid token', async () => {
      const res = await resetPassword({
        token: MOCK_RESET_TOKEN,
        password: 'NewStrongPass1!',
        passwordConfirmation: 'NewStrongPass1!',
      });
      expect(res.message).toContain('sucesso');
    });

    it('throws error when passwords do not match', async () => {
      await expect(
        resetPassword({
          token: MOCK_RESET_TOKEN,
          password: 'Password1!',
          passwordConfirmation: 'DifferentPassword2!',
        })
      ).rejects.toThrow('As senhas não coincidem');
    });

    it('throws error when token is expired', async () => {
      await expect(
        resetPassword({
          token: MOCK_EXPIRED_RESET_TOKEN,
          password: 'Password1!',
          passwordConfirmation: 'Password1!',
        })
      ).rejects.toThrow('Este link expirou');
    });
  });

  describe('listActiveSessions', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('GETs /api/auth/sessions and unwraps the list', async () => {
      const sessions = [
        {
          id: 's-1',
          deviceType: 'web',
          deviceName: 'Chrome',
          ipAddress: '127.0.0.1',
          lastUsedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
          current: true,
        },
      ];
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ data: sessions }), { status: 200 }));

      await expect(listActiveSessions()).resolves.toEqual(sessions);
      expect(fetchSpy.mock.calls[0][0]).toBe('/api/auth/sessions');
      expect(fetchSpy.mock.calls[0][1]?.method).toBe('GET');
    });

    it('rejects with the fallback message on failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));

      await expect(listActiveSessions()).rejects.toMatchObject({
        status: 500,
        message: 'Não foi possível carregar as sessões',
      });
    });
  });

  describe('terminateAllSessions', () => {
    it('terminates all sessions successfully', async () => {
      vi.mocked(endAllSessionsAction).mockResolvedValue({
        ok: true,
        data: { message: 'Todas as sessões foram encerradas.' },
      });

      await expect(terminateAllSessions()).resolves.toEqual({
        message: 'Todas as sessões foram encerradas.',
      });
    });

    it('throws error when termination fails', async () => {
      vi.mocked(endAllSessionsAction).mockResolvedValue({
        ok: false,
        status: 500,
        message: 'Erro ao revogar sessões',
      });

      await expect(terminateAllSessions()).rejects.toThrow('Erro ao revogar sessões');
    });
  });
});
