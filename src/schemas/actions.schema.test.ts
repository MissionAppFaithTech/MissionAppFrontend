import { describe, expect, it } from 'vitest';
import {
  changeEmailInputSchema,
  changePasswordInputSchema,
  faithCommunityIdSchema,
  updateAccountProfileInputSchema,
  updateFaithCommunityInputSchema,
} from './actions.schema';

const VALID_UUID = '019a0000-0000-7000-9000-00000000c001';

describe('actions.schema — account settings & ecclesiastical data', () => {
  describe('changeEmailInputSchema', () => {
    it('accepts a valid email and current password', () => {
      const result = changeEmailInputSchema.safeParse({
        email: 'novo.email@missao.org',
        currentPassword: 'Senha@123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects malformed email, empty password, or email longer than 254 characters', () => {
      expect(
        changeEmailInputSchema.safeParse({ email: 'invalido', currentPassword: 'Senha@123' })
          .success
      ).toBe(false);
      expect(
        changeEmailInputSchema.safeParse({ email: 'ok@missao.org', currentPassword: '' }).success
      ).toBe(false);
      expect(
        changeEmailInputSchema.safeParse({
          email: `${'a'.repeat(245)}@missao.org`,
          currentPassword: 'Senha@123',
        }).success
      ).toBe(false);
    });
  });

  describe('changePasswordInputSchema', () => {
    it('accepts matching passwords between 8 and 32 characters', () => {
      const result = changePasswordInputSchema.safeParse({
        currentPassword: 'Velha@123',
        newPassword: 'NovaSenha@123',
        newPasswordConfirmation: 'NovaSenha@123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty currentPassword, short/long newPassword, or mismatched confirmation', () => {
      expect(
        changePasswordInputSchema.safeParse({
          currentPassword: '',
          newPassword: 'NovaSenha@123',
          newPasswordConfirmation: 'NovaSenha@123',
        }).success
      ).toBe(false);
      expect(
        changePasswordInputSchema.safeParse({
          currentPassword: 'Velha@123',
          newPassword: 'curta',
          newPasswordConfirmation: 'curta',
        }).success
      ).toBe(false);
      expect(
        changePasswordInputSchema.safeParse({
          currentPassword: 'Velha@123',
          newPassword: 'A'.repeat(33),
          newPasswordConfirmation: 'A'.repeat(33),
        }).success
      ).toBe(false);
      const mismatch = changePasswordInputSchema.safeParse({
        currentPassword: 'Velha@123',
        newPassword: 'NovaSenha@123',
        newPasswordConfirmation: 'OutraSenha@123',
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe('updateAccountProfileInputSchema', () => {
    it('accepts a valid faithCommunityId UUID or null to unlink', () => {
      expect(
        updateAccountProfileInputSchema.safeParse({ faithCommunityId: VALID_UUID }).success
      ).toBe(true);
      expect(updateAccountProfileInputSchema.safeParse({ faithCommunityId: null }).success).toBe(
        true
      );
    });

    it('rejects a non-UUID faithCommunityId', () => {
      expect(
        updateAccountProfileInputSchema.safeParse({ faithCommunityId: 'nao-e-uuid' }).success
      ).toBe(false);
    });
  });

  describe('faithCommunityIdSchema & updateFaithCommunityInputSchema', () => {
    it('validates faithCommunityId as UUID', () => {
      expect(faithCommunityIdSchema.safeParse(VALID_UUID).success).toBe(true);
      expect(faithCommunityIdSchema.safeParse('123').success).toBe(false);
    });

    it('accepts updating faith community fields and nullable pastor fields', () => {
      expect(
        updateFaithCommunityInputSchema.safeParse({
          name: ' Igreja Batista Central ',
          city: 'Niterói',
          state: 'RJ',
          country: 'Brasil',
          pastorName: 'Pr. Carlos',
          pastorPhone: '+5521987654321',
        }).success
      ).toBe(true);

      expect(
        updateFaithCommunityInputSchema.safeParse({
          name: 'Igreja Sem Pastor',
          pastorName: null,
          pastorPhone: null,
        }).success
      ).toBe(true);
    });

    it('rejects pastorPhone without pastorName or outside E.164', () => {
      const missingName = updateFaithCommunityInputSchema.safeParse({
        name: 'Igreja',
        pastorPhone: '+5521987654321',
      });
      expect(missingName.success).toBe(false);

      const invalidPhone = updateFaithCommunityInputSchema.safeParse({
        name: 'Igreja',
        pastorName: 'Pr. Carlos',
        pastorPhone: '21987654321',
      });
      expect(invalidPhone.success).toBe(false);
    });
  });
});
