'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Stack, TextField, Typography, Tooltip, Box, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import PillButton from '@/components/common/PillButton';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth.schema';
import {
  getResetTokenStatus,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
  resetPassword,
} from '@/services/auth.service';

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
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  if (tokenStatus === 'invalid') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Link inválido
        </Typography>

        <Alert severity="error" role="alert" aria-live="assertive">
          O link de redefinição informado não é válido. Solicite um novo link para continuar.
        </Alert>

        <PillButton href="/forgot-password" tone="cta" fullWidth sx={{ minHeight: 44 }} startIcon={<EmailOutlinedIcon />}>
          Solicitar novo link
        </PillButton>

        <PillButton href="/login" tone="outline" fullWidth sx={{ minHeight: 44 }} startIcon={<ArrowBackIcon />}>
          Voltar para o login
        </PillButton>
      </Stack>
    );
  }

  if (tokenStatus === 'expired') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Link expirado
        </Typography>

        <Alert severity="warning" role="alert" aria-live="assertive">
          Este link de redefinição expirou (validade máxima de {RESET_PASSWORD_TOKEN_TTL_MINUTES}{' '}
          minutos). Por motivos de segurança, solicite um novo link.
        </Alert>

        <PillButton href="/forgot-password" tone="cta" fullWidth sx={{ minHeight: 44 }} startIcon={<EmailOutlinedIcon />}>
          Solicitar novo link
        </PillButton>

        <PillButton href="/login" tone="outline" fullWidth sx={{ minHeight: 44 }} startIcon={<ArrowBackIcon />}>
          Voltar para o login
        </PillButton>
      </Stack>
    );
  }

  if (done) {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Senha alterada com sucesso!
        </Typography>

        <Alert severity="success" role="alert" aria-live="assertive">
          Sua nova senha foi salva. Você já pode acessar sua conta com as novas credenciais.
        </Alert>

        <PillButton href="/login" tone="cta" fullWidth sx={{ minHeight: 44 }} startIcon={<LoginIcon />}>
          Entrar com a nova senha
        </PillButton>
      </Stack>
    );
  }

  const onSubmit = async (values: ResetPasswordFormData) => {
    setFormError(null);

    if (!token) {
      setFormError('Token de recuperação não informado');
      return;
    }

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
        render={({ field }) => (
          <TextField
            {...field}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Nova senha
                <Tooltip
                  title="Mínimo de 8 caracteres contendo letras maiúsculas, números e símbolos."
                  arrow
                  placement="top"
                >
                  <HelpOutlineIcon fontSize="inherit" color="action" />
                </Tooltip>
              </Box>
            }
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

      <PillButton
        type="submit"
        tone="cta"
        fullWidth
        disabled={isSubmitting}
        sx={{ minHeight: 48, fontWeight: 600 }}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
      >
        {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
      </PillButton>

      <PillButton href="/login" tone="outline" fullWidth sx={{ minHeight: 44 }} startIcon={<ArrowBackIcon />}>
        Voltar para o login
      </PillButton>
    </Stack>
  );
}
