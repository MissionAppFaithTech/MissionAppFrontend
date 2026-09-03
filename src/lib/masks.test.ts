import { describe, it, expect } from 'vitest';
import {
  maskBirthDate,
  maskCpfOrPassport,
  normalizeEmail,
  isValidEmail,
  isValidBirthDate,
} from './masks';

describe('masks and validations utility', () => {
  describe('maskBirthDate', () => {
    it('formats short inputs correctly', () => {
      expect(maskBirthDate('')).toBe('');
      expect(maskBirthDate('1')).toBe('1');
      expect(maskBirthDate('12')).toBe('12');
    });

    it('formats partial date with day and month', () => {
      expect(maskBirthDate('120')).toBe('12/0');
      expect(maskBirthDate('1205')).toBe('12/05');
    });

    it('formats full date and limits to 8 digits', () => {
      expect(maskBirthDate('12051995')).toBe('12/05/1995');
      expect(maskBirthDate('12051995999')).toBe('12/05/1995');
      expect(maskBirthDate('12a05b1995')).toBe('12/05/1995');
    });
  });

  describe('maskCpfOrPassport', () => {
    it('masks CPF numbers as 000.000.000-00', () => {
      expect(maskCpfOrPassport('123')).toBe('123');
      expect(maskCpfOrPassport('1234')).toBe('123.4');
      expect(maskCpfOrPassport('123456')).toBe('123.456');
      expect(maskCpfOrPassport('1234567')).toBe('123.456.7');
      expect(maskCpfOrPassport('123456789')).toBe('123.456.789');
      expect(maskCpfOrPassport('12345678901')).toBe('123.456.789-01');
      expect(maskCpfOrPassport('1234567890199')).toBe('123.456.789-01');
    });

    it('handles passport alphanumeric inputs uppercase without special chars', () => {
      expect(maskCpfOrPassport('ab123456')).toBe('AB123456');
      expect(maskCpfOrPassport('pass-1234')).toBe('PASS1234');
    });
  });

  describe('normalizeEmail', () => {
    it('removes spaces and converts to lowercase', () => {
      expect(normalizeEmail(' User@Domain.COM ')).toBe('user@domain.com');
      expect(normalizeEmail('te st@ex ample.com')).toBe('test@example.com');
    });
  });

  describe('isValidEmail', () => {
    it('validates proper email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
    });
  });

  describe('isValidBirthDate', () => {
    it('validates real dates in DD/MM/YYYY format', () => {
      expect(isValidBirthDate('15/08/1990')).toBe(true);
      expect(isValidBirthDate('29/02/2024')).toBe(true); // leap year
    });

    it('rejects invalid or malformed dates', () => {
      expect(isValidBirthDate('31/02/2023')).toBe(false);
      expect(isValidBirthDate('32/01/2020')).toBe(false);
      expect(isValidBirthDate('15/13/2020')).toBe(false);
      expect(isValidBirthDate('15-08-1990')).toBe(false);
      expect(isValidBirthDate('invalid')).toBe(false);
    });
  });
});
