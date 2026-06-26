'use client';

import { Controller, useForm } from 'react-hook-form';
import { TextField, Typography, Stack, Button } from '@mui/material';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import { isValidEmail, normalizeEmail } from '@/lib/masks';
import type { MissionariesStep3Values } from '../types';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

export default function MissionariesStep3() {
  const { formData, completeStep3, goBack } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MissionariesStep3Values>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      ...formData,
    },
  });

  const password = watch('password');

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(completeStep3)} sx={{ width: '100%' }}>
      <Typography variant="body1">Dados de acesso</Typography>

      <Controller
        name="username"
        control={control}
        rules={{
          required: 'Informe seu nome de usuário',
          minLength: { value: 3, message: 'Use pelo menos 3 caracteres' },
          pattern: {
            value: /^[a-z0-9_]+$/,
            message: 'Use apenas letras minúsculas, números e _',
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome de usuário"
            fullWidth
            placeholder="exemplo_usuario"
            error={Boolean(errors.username)}
            helperText={errors.username?.message}
            onChange={(event) =>
              field.onChange(event.target.value.toLowerCase().replace(/\s/g, ''))
            }
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Informe seu e-mail',
          validate: (value) => isValidEmail(value) || 'E-mail inválido',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="E-mail"
            type="email"
            fullWidth
            placeholder="seu@email.com"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            onChange={(event) => field.onChange(normalizeEmail(event.target.value))}
          />
        )}
      />

      <TextField
        {...register('password', {
          required: 'Informe sua senha',
          minLength: { value: 8, message: 'Use pelo menos 8 caracteres' },
        })}
        label="Senha"
        type="password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <PasswordStrengthIndicator password={password} />

      <TextField
        {...register('confirmPassword', {
          required: 'Confirme sua senha',
          validate: (value) => value === password || 'As senhas não coincidem',
        })}
        label="Confirmar senha"
        type="password"
        fullWidth
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
      />

      <Stack direction="row" spacing={2}>
        <Button type="button" variant="outlined" onClick={goBack} fullWidth>
          Voltar
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Finalizar cadastro
        </Button>
      </Stack>
    </Stack>
  );
}
