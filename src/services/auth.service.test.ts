import { describe, it, expect } from 'vitest';
import {
  login,
  requestPasswordReset,
  getResetTokenStatus,
  resetPassword,
} from './auth.service';
import { MOCK_RESET_TOKEN, MOCK_EXPIRED_RESET_TOKEN } from '@/mocks/auth';

describe('auth.service', () => {
  const validUserEmail = 'admin@missionapp.test';

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const res = await login({ login: validUserEmail, password: 'Password123!' });
      expect(res).toBeDefined();
      expect(res.data.data.user.email).toBe(validUserEmail);
      expect(res.data.data.accessToken).toBeDefined();
    });

    it('rejects invalid password or user', async () => {
      await expect(
        login({ login: 'nonexistent@domain.com', password: 'wrong' })
      ).rejects.toThrow();
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
});
