import { z } from 'zod';
import { PROFILE_PICTURE_MAX_BYTES, PROFILE_PICTURE_MIME_TYPES } from '@/lib/profilePicture';
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

const signupFields = {
  fullName: z.string().trim().min(1).max(255),
  username,
  phoneNumber: z.string().regex(E164),
  gender: z.enum(['MALE', 'FEMALE']),
  email: z.email(),
  password: z.string().min(8).max(32),
  passwordConfirmation: z.string().min(8).max(32),
};

export const signupInputSchema = z.object(signupFields);

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
  /** Confirmed `PROFILE_PICTURE` media asset; `null` removes the photo. */
  profilePictureId: z.uuid().nullable().optional(),
});

export const updatePublicContactsInputSchema = z.object({
  /** `null` removes the public contact. */
  publicEmail: z.email().max(254).nullable().optional(),
  publicPhone: z.string().regex(E164).nullable().optional(),
  publicPhoneIsWhatsapp: z.boolean().optional(),
  donationMessage: z.string().trim().max(5000).nullable().optional(),
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

/** Optional text; `null` clears the field (backend `.nullable()`). */
const longText = z.string().trim().max(5000).nullable().optional();
const shortText = z.string().trim().min(1).max(255).nullable().optional();

export const updateAboutInputSchema = z.object({
  aboutMe: longText,
  missionStorySummary: longText,
  originLocation: shortText,
  prayerRequest: longText,
  lifeVerse: shortText,
  /** `null` unlinks the faith community. */
  faithCommunityId: z.uuid().nullable().optional(),
  /** Replaces the agency; it cannot be cleared (the column is NOT NULL). */
  missionaryAgencyId: z.uuid().optional(),
  /** Replaces the whole work address in the same request. */
  workAddress: updateWorkAddressInputSchema.optional(),
});

const catalogItemFields = {
  name: z.string().trim().min(1).max(255),
  phoneNumber: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  website: z.string().trim().optional(),
};

const pastorFields = {
  pastorName: z.string().trim().min(1).max(255).optional(),
  pastorPhone: z.string().regex(E164).optional(),
};

/** The backend stores the pastor by name: a phone alone is rejected (422 on `pastorName`). */
const pastorNameWithPhone = (data: { pastorName?: string; pastorPhone?: string }) =>
  !data.pastorPhone || Boolean(data.pastorName);
const PASTOR_NAME_REQUIRED = {
  message: 'Informe o nome do pastor junto com o telefone',
  path: ['pastorName'],
};

/** Faith community (or any catalog item with a pastor). */
export const createCatalogItemInputSchema = z
  .object({ ...catalogItemFields, ...pastorFields })
  .refine(pastorNameWithPhone, PASTOR_NAME_REQUIRED);

/** Agencies have no pastor: zod strips those fields. */
export const createMissionaryAgencyInputSchema = z.object(catalogItemFields);
const missionaryAgencyInput = createMissionaryAgencyInputSchema;
const faithCommunityInput = z
  .object({ ...catalogItemFields, ...pastorFields })
  .refine(pastorNameWithPhone, PASTOR_NAME_REQUIRED);

/**
 * `POST /accounts/missionaries`: account, missionary profile and, when missing
 * from the catalog, the new agency and faith community, in one transaction.
 */
export const missionarySignupInputSchema = z
  .object({
    ...signupFields,
    birthDate: z.iso.date(),
    identityType: z.enum(['CPF', 'PASSPORT']).optional(),
    identityDocument: z.string().trim().min(1).max(50).optional(),
    aboutMe: z.string().trim().max(5000).optional(),
    missionaryAgencyId: z.uuid().optional(),
    missionaryAgency: missionaryAgencyInput.optional(),
    faithCommunityId: z.uuid().optional(),
    faithCommunity: faithCommunityInput.optional(),
  })
  .refine((data) => Boolean(data.identityType) === Boolean(data.identityDocument), {
    message: 'Informe o tipo e o número do documento',
    path: ['identityDocument'],
  })
  .refine((data) => Boolean(data.missionaryAgencyId) !== Boolean(data.missionaryAgency), {
    message: 'Selecione uma agência missionária ou cadastre uma nova',
    path: ['missionaryAgencyId'],
  })
  .refine((data) => !(data.faithCommunityId && data.faithCommunity), {
    message: 'Selecione uma comunidade de fé ou cadastre uma nova, não as duas',
    path: ['faithCommunityId'],
  });

export const profilePictureUploadInputSchema = z.object({
  mimeType: z.enum(PROFILE_PICTURE_MIME_TYPES),
  fileSizeBytes: z.number().int().min(1).max(PROFILE_PICTURE_MAX_BYTES),
});

export const mediaAssetIdSchema = z.uuid();

/** A report (RF 16): one reason, plus a free text (up to 250 words) for "other". */
export const reportInputSchema = z
  .object({
    targetType: z.enum(['profile', 'project', 'post']),
    targetId: z.string().trim().min(1).max(128),
    reason: z.enum(['false_content', 'spam', 'hate_violence', 'harassment', 'other']),
    details: z.string().trim().max(5000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.reason !== 'other') return;
    const words = value.details ? value.details.split(/\s+/).length : 0;
    if (words === 0) {
      ctx.addIssue({ code: 'custom', path: ['details'], message: 'Escreva a razão da denúncia' });
    } else if (words > 250) {
      ctx.addIssue({
        code: 'custom',
        path: ['details'],
        message: 'A razão deve ter no máximo 250 palavras',
      });
    }
  });
