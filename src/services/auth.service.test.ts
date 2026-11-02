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

describe('auth.service', () => {
  const validUserEmail = 'admin@missionapp.test';

  describe('login', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('successfully logs in with valid credentials', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            data: {
              user: { id: '1', fullName: 'Admin Seed', email: validUserEmail },
            },
          }),
        })
      );

      const res = await login({ login: validUserEmail, password: 'Password123!' });
      expect(res.user.email).toBe(validUserEmail);
    });

    it('rejects invalid password or user', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ message: 'E-mail ou senha inválidos' }),
        })
      );

      await expect(login({ login: 'nonexistent@domain.com', password: 'wrong' })).rejects.toThrow();
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
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('terminates all sessions successfully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ message: 'Todas as sessões foram encerradas' }),
        })
      );

      const res = await terminateAllSessions();
      expect(res.message).toBe('Todas as sessões foram encerradas');
    });

    it('throws error when termination fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ message: 'Erro ao revogar sessões' }),
        })
      );

      await expect(terminateAllSessions()).rejects.toThrow('Erro ao revogar sessões');
    });
  });
});
