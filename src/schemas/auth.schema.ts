import { z } from 'zod';
import { isValidEmail } from '@/lib/masks';
import { validateStrongPassword } from '@/lib/passwordStrength';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .refine((val) => isValidEmail(val), { message: 'Informe um e-mail válido' }),
  password: z.string().min(1, 'Informe sua senha'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  login: z
    .string()
    .min(1, 'Informe seu e-mail ou nome de usuário')
    .refine(
      (val) => {
        const trimmed = val.trim();
        if (isValidEmail(trimmed)) return true;
        return trimmed.length >= 3 && trimmed.length <= 32 && /^[a-z0-9_]+$/i.test(trimmed);
      },
      { message: 'Informe um e-mail válido ou um nome de usuário (3 a 32 caracteres)' }
    ),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Informe sua nova senha')
      .refine((val) => validateStrongPassword(val) === true, {
        message:
          'A senha deve ter no mínimo 8 caracteres com letras maiúsculas, números e símbolos',
      }),
    confirmPassword: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
