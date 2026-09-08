import { z } from 'zod';
import { isValidEmail } from '@/lib/masks';

export const profileEditSchema = z.object({
  username: z.string().trim().min(3, 'Nome de usuário inválido'),
  displayName: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  bio: z.string().trim().min(2, 'Informe sua atuação ou papel na missão'),
  currentLocation: z.string().trim().min(1, 'Selecione ou informe sua localização'),
  publicEmail: z
    .string()
    .trim()
    .refine((val) => !val || isValidEmail(val), { message: 'Informe um e-mail válido' }),
  publicPhone: z.string(),
  whatsappNumber: z.string(),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export const supporterEditSchema = z.object({
  username: z.string().trim().min(3, 'Nome de usuário inválido'),
  displayName: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  bio: z.string(),
  currentLocation: z.string().trim().min(1, 'Selecione ou informe sua localização'),
  publicEmail: z
    .string()
    .trim()
    .refine((val) => !val || isValidEmail(val), { message: 'Informe um e-mail válido' }),
  publicPhone: z.string(),
  whatsappNumber: z.string(),
});

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
  introduction: z.string(),
  missionHistory: z.string(),
  originLocation: z.string(),
  currentLocation: z.string(),
  missionaryAgency: z.string(),
  faithCommunity: z.string(),
  prayerRequests: z.string(),
  lifeVerse: z.string(),
});

export type ProfileAboutFormData = z.infer<typeof profileAboutSchema>;
