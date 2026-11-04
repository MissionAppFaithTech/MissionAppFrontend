import { z } from 'zod';
import { isValidEmail } from '@/lib/masks';

export const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail')
  .max(254, 'Use no máximo 254 caracteres')
  .refine((val) => val.includes('@'), { message: 'Inclua um @ no e-mail' })
  .refine((val) => isValidEmail(val), { message: 'Informe um e-mail válido' });
