import { describe, it, expect } from 'vitest';
import {
  supporterStep1Schema,
  missionaryStep1Schema,
  missionaryStep2Schema,
  accessCredentialsSchema,
} from './register.schema';
import { EMPTY_FAITH_COMMUNITY, EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';

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
        communityDetails: EMPTY_FAITH_COMMUNITY,
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
        communityDetails: EMPTY_FAITH_COMMUNITY,
      });
      expect(missingEmail.success).toBe(false);

      const invalidEmail = supporterStep1Schema.safeParse({
        fullName: 'Apoiador Teste',
        email: 'not-an-email',
        birthDate: '15/05/1990',
        gender: 'masculino',
        phone: '+5511987654321',
        faithCommunity: '',
        communityDetails: EMPTY_FAITH_COMMUNITY,
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

  describe('missionaryStep2Schema', () => {
    it('rejects an incomplete custom agency', () => {
      const result = missionaryStep2Schema.safeParse({
        missionaryAgency: 'other',
        agencyDetails: EMPTY_MISSIONARY_AGENCY,
        missionDescription: 'Atuação no campo',
        faithCommunity: 'community-1',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      });

      expect(result.success).toBe(false);
    });

    it('accepts a completed custom agency and catalog church', () => {
      const result = missionaryStep2Schema.safeParse({
        missionaryAgency: 'other',
        agencyDetails: {
          ...EMPTY_MISSIONARY_AGENCY,
          name: 'Nova Agência',
          country: 'Brasil',
          state: 'SP',
          city: 'Campinas',
          phone: '+5511987654321',
        },
        missionDescription: 'Atuação no campo',
        faithCommunity: 'community-1',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      });

      expect(result.success).toBe(true);
    });
  });
});
