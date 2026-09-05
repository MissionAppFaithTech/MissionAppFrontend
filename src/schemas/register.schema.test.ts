import { describe, it, expect } from 'vitest';
import {
  supporterStep1Schema,
  missionaryStep1Schema,
  accessCredentialsSchema,
} from './register.schema';

describe('register.schema', () => {
  describe('supporterStep1Schema', () => {
    it('accepts valid supporter personal data with email', () => {
      const result = supporterStep1Schema.safeParse({
        fullName: 'Apoiador Teste',
        email: 'apoiador@teste.com',
        birthDate: '15/05/1990',
        gender: 'masculino',
        phone: '+5511987654321',
        faithCommunity: '',
        communityPhone: '',
        pastorName: '',
        pastorPhone: '',
      });

      expect(result.success).toBe(true);
    });

    it('rejects missing or invalid email', () => {
      const missingEmail = supporterStep1Schema.safeParse({
        fullName: 'Apoiador Teste',
        email: '',
        birthDate: '15/05/1990',
        gender: 'masculino',
        phone: '+5511987654321',
        faithCommunity: '',
        communityPhone: '',
        pastorName: '',
        pastorPhone: '',
      });
      expect(missingEmail.success).toBe(false);

      const invalidEmail = supporterStep1Schema.safeParse({
        fullName: 'Apoiador Teste',
        email: 'not-an-email',
        birthDate: '15/05/1990',
        gender: 'masculino',
        phone: '+5511987654321',
        faithCommunity: '',
        communityPhone: '',
        pastorName: '',
        pastorPhone: '',
      });
      expect(invalidEmail.success).toBe(false);
    });
  });

  describe('missionaryStep1Schema', () => {
    it('accepts valid missionary personal data with email', () => {
      const result = missionaryStep1Schema.safeParse({
        fullName: 'Missionário Teste',
        email: 'missionario@teste.com',
        birthDate: '20/10/1985',
        gender: 'feminino',
        document: '123.456.789-00',
        phone: '+5511987654321',
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = missionaryStep1Schema.safeParse({
        fullName: 'Missionário Teste',
        email: 'email-invalido',
        birthDate: '20/10/1985',
        gender: 'feminino',
        document: '123.456.789-00',
        phone: '+5511987654321',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('accessCredentialsSchema', () => {
    it('accepts valid credentials without requiring email', () => {
      const result = accessCredentialsSchema.safeParse({
        username: 'usuario_valido',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

      expect(result.success).toBe(true);
    });

    it('rejects mismatched password and confirmPassword', () => {
      const result = accessCredentialsSchema.safeParse({
        username: 'usuario_valido',
        password: 'Password@123',
        confirmPassword: 'Password@999',
      });

      expect(result.success).toBe(false);
    });
  });
});
