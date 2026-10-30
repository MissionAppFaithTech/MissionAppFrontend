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

export const profileEditSchema = z
  .object({
    username: z.string().trim().min(3, 'Nome de usuário inválido'),
    displayName: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    bio: z.string().trim().min(2, 'Informe sua atuação ou papel na missão'),
    currentLocation: z.string().optional().or(z.literal('')),
    ...publicContactFields,
  })
  .superRefine(refinePublicContact);

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

export const profileAboutSchema = z.object({
  introduction: z.string().max(5000, 'Use no máximo 5000 caracteres').optional().or(z.literal('')),
  missionHistory: z
    .string()
    .max(5000, 'Use no máximo 5000 caracteres')
    .optional()
    .or(z.literal('')),
  originLocation: z.string().max(255, 'Use no máximo 255 caracteres').optional().or(z.literal('')),
  currentLocation: z.string().optional().or(z.literal('')),
  missionaryAgency: z.string().optional().or(z.literal('')),
  faithCommunity: z.string().optional().or(z.literal('')),
  prayerRequests: z
    .string()
    .max(5000, 'Use no máximo 5000 caracteres')
    .optional()
    .or(z.literal('')),
  lifeVerse: z.string().max(255, 'Use no máximo 255 caracteres').optional().or(z.literal('')),
});

export type ProfileAboutFormData = z.infer<typeof profileAboutSchema>;
