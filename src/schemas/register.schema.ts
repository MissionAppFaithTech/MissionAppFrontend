import { z } from 'zod';
import { isValidInternationalPhone } from '@/components/common/PhoneField';
import { SELECT_OTHER } from '@/forms/register/options';
import { isValidBirthDate } from '@/lib/masks';
import { validateStrongPassword } from '@/lib/passwordStrength';
import {
  createFaithCommunitySchema,
  createMissionaryAgencySchema,
} from '@/schemas/catalog-create.schema';
import { requiredEmailSchema } from '@/schemas/email';

export const missionaryStep1Schema = z.object({
  fullName: z.string().trim().min(1, 'Informe seu nome completo'),
  birthDate: z
    .string()
    .min(1, 'Informe sua data de nascimento')
    .refine((val) => isValidBirthDate(val), { message: 'Use o formato DD/MM/AAAA' }),
  gender: z.enum(['feminino', 'masculino'], {
    message: 'Selecione o gênero',
  }),
  document: z.string().trim().min(1, 'Informe CPF ou passaporte'),
  phone: z
    .string()
    .min(1, 'Informe seu telefone')
    .refine(
      (val) => {
        if (!val.replace(/\D/g, '')) return false;
        return isValidInternationalPhone(val);
      },
      { message: 'Informe um telefone válido' }
    ),
  email: requiredEmailSchema,
});

export type MissionaryStep1FormData = z.infer<typeof missionaryStep1Schema>;

const catalogDetailsDraft = z.object({
  name: z.string(),
  address1: z.string(),
  address2: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipCode: z.string(),
  website: z.string(),
});

export const missionaryStep2Schema = z
  .object({
    missionaryAgency: z.string().trim().min(1, 'Selecione a agência missionária'),
    agencyDetails: catalogDetailsDraft.extend({
      phone: z.string(),
    }),
    missionDescription: z.string().trim().min(1, 'Descreva seu projeto ou atuação missionária'),
    faithCommunity: z.string().trim().min(1, 'Selecione a comunidade de fé'),
    communityDetails: catalogDetailsDraft.extend({
      churchPhone: z.string(),
      pastorName: z.string(),
      pastorPhone: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.missionaryAgency === SELECT_OTHER &&
      !createMissionaryAgencySchema.safeParse(data.agencyDetails).success
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Complete o cadastro da agência missionária',
        path: ['missionaryAgency'],
      });
    }

    if (
      data.faithCommunity === SELECT_OTHER &&
      !createFaithCommunitySchema.safeParse(data.communityDetails).success
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Complete o cadastro da igreja',
        path: ['faithCommunity'],
      });
    }
  });

export type MissionaryStep2FormData = z.infer<typeof missionaryStep2Schema>;

export const supporterStep1Schema = z
  .object({
    fullName: z.string().trim().min(1, 'Informe seu nome completo'),
    birthDate: z
      .string()
      .min(1, 'Informe sua data de nascimento')
      .refine((val) => isValidBirthDate(val), { message: 'Use o formato DD/MM/AAAA' }),
    gender: z.enum(['feminino', 'masculino'], {
      message: 'Selecione o gênero',
    }),
    phone: z
      .string()
      .min(1, 'Informe seu telefone')
      .refine(
        (val) => {
          if (!val.replace(/\D/g, '')) return false;
          return isValidInternationalPhone(val);
        },
        { message: 'Informe um telefone válido' }
      ),
    email: requiredEmailSchema,
    faithCommunity: z.string(),
    communityDetails: catalogDetailsDraft.extend({
      churchPhone: z.string(),
      pastorName: z.string(),
      pastorPhone: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.faithCommunity === SELECT_OTHER &&
      !createFaithCommunitySchema.safeParse(data.communityDetails).success
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Complete o cadastro da igreja',
        path: ['faithCommunity'],
      });
    }
  });

export type SupporterStep1FormData = z.infer<typeof supporterStep1Schema>;

export const accessCredentialsSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Informe seu nome de usuário')
      .min(3, 'Use pelo menos 3 caracteres')
      .max(32, 'Use no máximo 32 caracteres')
      .regex(/^[a-z0-9_]+$/, 'Use apenas letras minúsculas, números e _'),
    email: z.string().optional(),
    password: z
      .string()
      .min(1, 'Informe sua senha')
      .refine((val) => validateStrongPassword(val) === true, {
        message: 'Use maiúscula, minúscula, número e caractere especial (mín. 8)',
      }),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmPassword'],
  });

export type AccessCredentialsFormData = z.infer<typeof accessCredentialsSchema>;
