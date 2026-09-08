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
    expect(res.label).toBe('');
    expect(res.color).toBe('inherit');
  });

  it('classifies weak passwords', () => {
    const res = getPasswordStrength('abc');
    expect(res.level).toBe('weak');
    expect(res.color).toBe('error');
    expect(res.label).toBe('Senha fraca');
    expect(res.score).toBe(33);
  });

  it('classifies medium passwords', () => {
    // 8 chars + lower + upper (3 or 4 met)
    const res = getPasswordStrength('Abcdefgh');
    expect(res.level).toBe('medium');
    expect(res.color).toBe('warning');
    expect(res.label).toBe('Senha média');
    expect(res.score).toBe(66);
  });

  it('classifies strong passwords with bonus for 12+ chars', () => {
    // Meets all 5 requirements and has 12+ chars -> 100
    const res12 = getPasswordStrength('Password123!');
    expect(res12.level).toBe('strong');
    expect(res12.color).toBe('success');
    expect(res12.label).toBe('Senha forte');
    expect(res12.score).toBe(100);

    // Meets all 5 requirements but only 8-11 chars -> 85
    const res8 = getPasswordStrength('Pass123!');
    expect(res8.level).toBe('strong');
    expect(res8.color).toBe('success');
    expect(res8.label).toBe('Senha forte');
    expect(res8.score).toBe(85);
  });

  describe('validateStrongPassword', () => {
    it('returns error when empty', () => {
      expect(validateStrongPassword('')).toBe('Informe sua senha');
    });

    it('returns true when all criteria are met', () => {
      expect(validateStrongPassword('ValidPass1!')).toBe(true);
    });

    it('returns missing requirements when not strong', () => {
      expect(validateStrongPassword('abcdefgh1!')).toBe('Senha fraca: inclua uma letra maiúscula');
      expect(validateStrongPassword('ABCDEFGH1!')).toBe('Senha fraca: inclua uma letra minúscula');
      expect(validateStrongPassword('Abcdefgh!!')).toBe('Senha fraca: inclua um número');
      expect(validateStrongPassword('Abcdefgh12')).toBe(
        'Senha fraca: inclua um caractere especial (!@#$…)'
      );
      expect(validateStrongPassword('Ab1!')).toBe('Senha fraca: inclua pelo menos 8 caracteres');
      expect(validateStrongPassword('short')).toBe(
        'Senha fraca: inclua pelo menos 8 caracteres, uma letra maiúscula, um número, um caractere especial (!@#$…)'
      );
    });
  });

  describe('passwordRequirements', () => {
    it('has 5 standard requirements with working tests', () => {
      expect(passwordRequirements).toHaveLength(5);
      const [len, lower, upper, digit, special] = passwordRequirements;
      expect(len.test('12345678')).toBe(true);
      expect(len.test('1234567')).toBe(false);
      expect(lower.test('a')).toBe(true);
      expect(lower.test('A')).toBe(false);
      expect(upper.test('A')).toBe(true);
      expect(upper.test('a')).toBe(false);
      expect(digit.test('1')).toBe(true);
      expect(digit.test('a')).toBe(false);
      expect(special.test('@')).toBe(true);
      expect(special.test('a')).toBe(false);
    });
  });
});
