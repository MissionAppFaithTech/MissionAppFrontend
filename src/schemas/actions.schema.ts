import { z } from 'zod';
import { BIO_MAX_LENGTH } from '@/schemas/profile.schema';

/**
 * Input of the Server Actions (ADR-0006). They are public POST endpoints, so
 * every input is validated on the server too, with the backend's limits.
 */

// Messages reach the UI as `fieldErrors`: keep them in Portuguese.
z.config(z.locales.pt());

const E164 = /^\+[1-9]\d{1,14}$/;
const username = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_]+$/);

export const loginInputSchema = z.object({
  login: z.email(),
  password: z.string().min(1).max(128),
});

/** Session family id from `GET /auth/sessions` (UUID v7). */
export const sessionIdSchema = z.uuid();

export const forgotPasswordInputSchema = z.object({
  login: z.email(),
});

export const resetPasswordInputSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(32, 'A senha deve ter no máximo 32 caracteres'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });

export const signupInputSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  username,
  phoneNumber: z.string().regex(E164),
  gender: z.enum(['MALE', 'FEMALE']),
  email: z.email(),
  password: z.string().min(8).max(32),
  passwordConfirmation: z.string().min(8).max(32),
});

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
      .max(32, 'A nova senha deve ter no máximo 32 caracteres'),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['newPasswordConfirmation'],
  });

export const updateAccountProfileInputSchema = z.object({
  fullName: z.string().trim().min(1).max(255).optional(),
  username: username.optional(),
  /** `null` clears the mini-bio. */
  biography: z.string().trim().max(BIO_MAX_LENGTH).nullable().optional(),
});

export const createMissionaryProfileInputSchema = z.object({
  missionaryAgencyId: z.uuid(),
});

export const updatePublicContactsInputSchema = z.object({
  /** `null` removes the public contact. */
  publicEmail: z.email().max(254).nullable().optional(),
  publicPhone: z.string().regex(E164).nullable().optional(),
  publicPhoneIsWhatsapp: z.boolean().optional(),
  donationMessage: z.string().trim().max(5000).nullable().optional(),
});

/** Optional text; `null` clears the field (backend `.nullable()`). */
const longText = z.string().trim().max(5000).nullable().optional();
const shortText = z.string().trim().min(1).max(255).nullable().optional();

export const updateAboutInputSchema = z.object({
  aboutMe: longText,
  missionStorySummary: longText,
  originLocation: shortText,
  prayerRequest: longText,
  lifeVerse: shortText,
  faithCommunityId: z.uuid().optional(),
});

export const updateIdentityInputSchema = z.object({
  identityType: z.enum(['CPF', 'PASSPORT']),
  identityDocument: z.string().trim().min(1).max(50),
});

const required = (max: number) => z.string().trim().min(1).max(max);

/** Full replace (upsert): the backend requires every field. */
export const updateWorkAddressInputSchema = z.object({
  zip: required(20),
  district: required(255),
  city: required(255),
  state: required(255),
  country: required(255),
});

export const createCatalogItemInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  phoneNumber: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  website: z.string().trim().optional(),
});
