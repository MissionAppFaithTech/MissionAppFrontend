import { describe, it, expect } from 'vitest';
import {
  getPasswordStrength,
  validateStrongPassword,
  passwordRequirements,
} from './passwordStrength';

describe('passwordStrength utility', () => {
  it('handles empty password', () => {
    const res = getPasswordStrength('');
    expect(res.level).toBe('empty');
    expect(res.score).toBe(0);
  });

  it('classifies weak passwords', () => {
    const res = getPasswordStrength('abc');
    expect(res.level).toBe('weak');
    expect(res.color).toBe('error');
    expect(res.score).toBe(33);
  });

  it('classifies medium passwords', () => {
    // 8 chars + lower + upper (3 or 4 met)
    const res = getPasswordStrength('Abcdefgh');
    expect(res.level).toBe('medium');
    expect(res.color).toBe('warning');
    expect(res.score).toBe(66);
  });

  it('classifies strong passwords', () => {
    // Meets all 5 requirements
    const res = getPasswordStrength('Password123!');
    expect(res.level).toBe('strong');
    expect(res.color).toBe('success');
    expect(res.score).toBe(100);
  });

  describe('validateStrongPassword', () => {
    it('returns error when empty', () => {
      expect(validateStrongPassword('')).toBe('Informe sua senha');
    });

    it('returns true when all criteria are met', () => {
      expect(validateStrongPassword('ValidPass1!')).toBe(true);
    });

    it('returns missing requirements when not strong', () => {
      const res = validateStrongPassword('short');
      expect(typeof res).toBe('string');
      expect(res).toContain('Senha fraca');
    });
  });

  describe('passwordRequirements', () => {
    it('has 5 standard requirements', () => {
      expect(passwordRequirements).toHaveLength(5);
    });
  });
});
