import { z } from 'zod';
import { isValidEmail } from '@/lib/masks';

function isValidPublicPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10;
}

const publicContactFields = {
  publicEmail: z
    .string()
    .trim()
    .refine((val) => !val || isValidEmail(val), { message: 'Informe um e-mail válido' }),
  publicPhone: z.string(),
  showPublicEmail: z.boolean(),
  showPublicPhone: z.boolean(),
  allowWhatsappContact: z.boolean(),
};

function refinePublicContact(
  data: {
    publicEmail: string;
    publicPhone: string;
    showPublicEmail: boolean;
    showPublicPhone: boolean;
    allowWhatsappContact: boolean;
  },
  ctx: z.RefinementCtx
) {
  if (data.showPublicEmail && !isValidEmail(data.publicEmail)) {
    ctx.addIssue({
      code: 'custom',
      path: ['publicEmail'],
      message: 'Informe um e-mail válido',
    });
  }

  if (
    (data.showPublicPhone || data.allowWhatsappContact) &&
    !isValidPublicPhone(data.publicPhone)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['publicPhone'],
      message: 'Informe um telefone válido',
    });
  }
}

/** Digits of a phone value; a bare country code (e.g. "+55") counts as empty. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export const BIO_MAX_LENGTH = 200;
export const ABOUT_LONG_MAX_LENGTH = 5000;
export const ABOUT_SHORT_MAX_LENGTH = 255;

/** Header edit (RF 10.5), mirroring the backend validators. */
export const profileEditSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Informe seu nome')
    .max(255, 'Use no máximo 255 caracteres'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(32, 'Use no máximo 32 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Use apenas letras minúsculas, números e _ (sem espaços ou acentos)'),
  bio: z.string().trim().max(BIO_MAX_LENGTH, `Use no máximo ${BIO_MAX_LENGTH} caracteres`),
  publicEmail: z
    .string()
    .trim()
    .max(254, 'Use no máximo 254 caracteres')
    .refine((val) => !val || isValidEmail(val), { message: 'Informe um e-mail válido' }),
  publicPhone: z
    .string()
    .refine((val) => phoneDigits(val).length <= 3 || /^\+[1-9]\d{7,14}$/.test(val), {
      message: 'Informe um telefone válido com DDD',
    }),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export const supporterEditSchema = z
  .object({
    username: z.string().trim().min(3, 'Nome de usuário inválido'),
    displayName: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    bio: z.string(),
    currentLocation: z.string().trim().min(1, 'Selecione ou informe sua localização'),
    ...publicContactFields,
  })
  .superRefine(refinePublicContact);

export type SupporterEditFormData = z.infer<typeof supporterEditSchema>;

export const supporterAboutSchema = z.object({
  introduction: z.string().max(1000, 'A bio não pode ultrapassar 1000 caracteres'),
  originLocation: z.string(),
  currentLocation: z.string(),
  faithCommunity: z.string(),
  lifeVerse: z.string(),
});

export type SupporterAboutFormData = z.infer<typeof supporterAboutSchema>;

const longAboutText = z
  .string()
  .trim()
  .max(ABOUT_LONG_MAX_LENGTH, `Use no máximo ${ABOUT_LONG_MAX_LENGTH} caracteres`);
const shortAboutText = z
  .string()
  .trim()
  .max(ABOUT_SHORT_MAX_LENGTH, `Use no máximo ${ABOUT_SHORT_MAX_LENGTH} caracteres`);

const WORK_ADDRESS_FIELDS = ['country', 'state', 'city', 'district', 'zip'] as const;

/** "Sobre" edit (RF 10.7.2) plus the structured "Local de atuação" (work address). */
export const profileAboutSchema = z
  .object({
    introduction: longAboutText,
    missionHistory: longAboutText,
    originLocation: shortAboutText,
    prayerRequests: longAboutText,
    lifeVerse: shortAboutText,
    workAddress: z.object({
      country: shortAboutText,
      state: shortAboutText,
      city: shortAboutText,
      district: shortAboutText,
      zip: z.string().trim().max(20, 'Use no máximo 20 caracteres'),
    }),
  })
  .superRefine((data, ctx) => {
    // The backend upserts the whole address: once one field is filled, all are required.
    const filled = WORK_ADDRESS_FIELDS.filter((key) => data.workAddress[key].length > 0);
    if (filled.length === 0 || filled.length === WORK_ADDRESS_FIELDS.length) return;
    for (const key of WORK_ADDRESS_FIELDS) {
      if (!data.workAddress[key]) {
        ctx.addIssue({
          code: 'custom',
          path: ['workAddress', key],
          message: 'Preencha para salvar o local de atuação',
        });
      }
    }
  });

export type ProfileAboutFormData = z.infer<typeof profileAboutSchema>;
