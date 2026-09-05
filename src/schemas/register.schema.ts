import { z } from 'zod';
import { isValidInternationalPhone } from '@/components/common/PhoneField';
import { isValidBirthDate, isValidEmail } from '@/lib/masks';
import { validateStrongPassword } from '@/lib/passwordStrength';

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
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail')
    .refine((val) => isValidEmail(val), { message: 'Informe um e-mail válido' }),
});

export type MissionaryStep1FormData = z.infer<typeof missionaryStep1Schema>;

export const missionaryStep2Schema = z
  .object({
    missionaryAgency: z.string().trim().min(1, 'Selecione a agência missionária'),
    agencyCustomName: z.string(),
    agencyPhone: z.string(),
    missionDescription: z.string().trim().min(1, 'Descreva seu projeto ou atuação missionária'),
    faithCommunity: z.string().trim().min(1, 'Selecione a comunidade de fé'),
    communityPhone: z.string(),
    pastorName: z.string(),
    pastorPhone: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.missionaryAgency === 'other') {
      if (!data.agencyCustomName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o nome da agência',
          path: ['agencyCustomName'],
        });
      }
      const rawAgencyPhone = (data.agencyPhone || '').replace(/\D/g, '');
      if (!rawAgencyPhone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o telefone da agência missionária',
          path: ['agencyPhone'],
        });
      } else if (!isValidInternationalPhone(data.agencyPhone || '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido',
          path: ['agencyPhone'],
        });
      }
    }

    if (data.faithCommunity === 'other') {
      const rawCommPhone = (data.communityPhone || '').replace(/\D/g, '');
      if (!rawCommPhone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o telefone da comunidade de fé',
          path: ['communityPhone'],
        });
      } else if (!isValidInternationalPhone(data.communityPhone || '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido',
          path: ['communityPhone'],
        });
      }
      if (!data.pastorName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o nome do pastor',
          path: ['pastorName'],
        });
      }
      const rawPastorPhone = (data.pastorPhone || '').replace(/\D/g, '');
      if (!rawPastorPhone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o telefone do pastor',
          path: ['pastorPhone'],
        });
      } else if (!isValidInternationalPhone(data.pastorPhone || '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido',
          path: ['pastorPhone'],
        });
      }
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
    email: z
      .string()
      .trim()
      .min(1, 'Informe seu e-mail')
      .refine((val) => isValidEmail(val), { message: 'Informe um e-mail válido' }),
    faithCommunity: z.string(),
    communityPhone: z.string(),
    pastorName: z.string(),
    pastorPhone: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.faithCommunity === 'other') {
      const rawCommPhone = (data.communityPhone || '').replace(/\D/g, '');
      if (!rawCommPhone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o telefone da comunidade de fé',
          path: ['communityPhone'],
        });
      } else if (!isValidInternationalPhone(data.communityPhone || '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido',
          path: ['communityPhone'],
        });
      }
      if (!data.pastorName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o nome do pastor',
          path: ['pastorName'],
        });
      }
      const rawPastorPhone = (data.pastorPhone || '').replace(/\D/g, '');
      if (!rawPastorPhone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o telefone do pastor',
          path: ['pastorPhone'],
        });
      } else if (!isValidInternationalPhone(data.pastorPhone || '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um telefone válido',
          path: ['pastorPhone'],
        });
      }
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
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type AccessCredentialsFormData = z.infer<typeof accessCredentialsSchema>;
