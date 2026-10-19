import { z } from 'zod';
import { isValidInternationalPhone } from '@/components/common/PhoneField';

function requiredText(message: string) {
  return z.string().trim().min(1, message);
}

function isBlankPhone(value: string) {
  return value.replace(/\D/g, '').length <= 4;
}

function requiredPhone(emptyMessage: string) {
  return z.string().superRefine((value, ctx) => {
    if (isBlankPhone(value)) {
      ctx.addIssue({ code: 'custom', message: emptyMessage });
      return;
    }

    if (!isValidInternationalPhone(value)) {
      ctx.addIssue({ code: 'custom', message: 'Informe um telefone válido' });
    }
  });
}

function optionalWebsite() {
  return z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) return true;
        return /https?:\/\/.+\..+|.+\.[a-z]{2,}/i.test(value);
      },
      { message: 'Informe um site válido' }
    );
}

export const createMissionaryAgencySchema = z.object({
  name: requiredText('Informe o nome da agência'),
  country: requiredText('Informe o país'),
  state: requiredText('Informe o estado'),
  city: requiredText('Informe a cidade'),
  phone: requiredPhone('Informe o telefone da agência'),
  address1: z.string(),
  address2: z.string(),
  zipCode: z.string(),
  website: optionalWebsite(),
});

export type CreateMissionaryAgencyFormData = z.infer<typeof createMissionaryAgencySchema>;

export const createFaithCommunitySchema = z.object({
  name: requiredText('Informe o nome da igreja'),
  country: requiredText('Informe o país'),
  state: requiredText('Informe o estado'),
  city: requiredText('Informe a cidade'),
  churchPhone: requiredPhone('Informe o telefone da igreja'),
  pastorName: requiredText('Informe o nome do pastor'),
  pastorPhone: requiredPhone('Informe o telefone do pastor'),
  address1: z.string(),
  address2: z.string(),
  zipCode: z.string(),
  website: optionalWebsite(),
});

export type CreateFaithCommunityFormData = z.infer<typeof createFaithCommunitySchema>;
