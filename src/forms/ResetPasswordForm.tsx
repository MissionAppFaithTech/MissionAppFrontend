'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import { validateStrongPassword } from '@/lib/passwordStrength';
import {
  getResetTokenStatus,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
  resetPassword,
} from '@/services/auth.service';

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

type ResetPasswordFormProps = {
  token: string | null;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const tokenStatus = getResetTokenStatus(token);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordValues>({
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const canSubmit = useMemo(() => {
    const passwordOk = validateStrongPassword(password) === true;
    const confirmOk = confirmPassword.length > 0 && confirmPassword === password;
    return (
      Boolean(token) &&
      tokenStatus !== 'invalid' &&
      tokenStatus !== 'expired' &&
      isValid &&
      passwordOk &&
      confirmOk
    );
  }, [confirmPassword, isValid, password, token, tokenStatus]);

  if (tokenStatus === 'invalid') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Link inválido
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este link de redefinição é inválido ou está incompleto. Solicite um novo e-mail em
          “Esqueci minha senha”.
        </Typography>
        <Button
          component={Link}
          href="/forgot-password"
          variant="contained"
          color="primary"
          fullWidth
        >
          Solicitar novo link
        </Button>
        <Button component={Link} href="/login" variant="text" fullWidth>
          Voltar para o login
        </Button>
      </Stack>
    );
  }

  if (tokenStatus === 'expired') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Link expirado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Este link de redefinição expirou (válido por {RESET_PASSWORD_TOKEN_TTL_MINUTES} minutos).
          Solicite um novo e-mail para continuar.
        </Typography>
        <Button
          component={Link}
          href="/forgot-password"
          variant="contained"
          color="primary"
          fullWidth
        >
          Solicitar novo link
        </Button>
        <Button component={Link} href="/login" variant="text" fullWidth>
          Voltar para o login
        </Button>
      </Stack>
    );
  }

  if (done) {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Senha atualizada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sua nova senha foi salva. Você já pode entrar na sua conta.
        </Typography>
        <Button component={Link} href="/login" variant="contained" color="primary" fullWidth>
          Ir para o login
        </Button>
      </Stack>
    );
  }

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    setFormError(null);

    try {
      await resetPassword({
        token,
        password: values.password,
        passwordConfirmation: values.confirmPassword,
      });
      setDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível redefinir a senha');
    }
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body2" color="text.secondary">
        Escolha uma nova senha forte para a sua conta. Este link expira em{' '}
        {RESET_PASSWORD_TOKEN_TTL_MINUTES} minutos após o envio do e-mail.
      </Typography>

      {formError ? <Alert severity="error">{formError}</Alert> : null}

      <Controller
        name="password"
        control={control}
        rules={{
          validate: (value) => validateStrongPassword(value),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nova senha"
            type="password"
            fullWidth
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
        )}
      />

      <PasswordStrengthIndicator password={password} />

      <Controller
        name="confirmPassword"
        control={control}
        rules={{
          required: 'Confirme sua senha',
          validate: (value) => value === password || 'As senhas não coincidem',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirmar nova senha"
            type="password"
            fullWidth
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
      </Button>

      <Button component={Link} href="/login" variant="text" fullWidth>
        Voltar para o login
      </Button>
    </Stack>
  );
}
