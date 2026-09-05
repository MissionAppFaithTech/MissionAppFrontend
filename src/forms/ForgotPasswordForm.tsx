'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import PillButton from '@/components/common/PillButton';
import { normalizeEmail } from '@/lib/masks';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth.schema';
import { requestPasswordReset, RESET_PASSWORD_TOKEN_TTL_MINUTES } from '@/services/auth.service';

type SubmitState =
  | { status: 'idle' }
  | { status: 'success'; email: string; resetPath?: string }
  | { status: 'not_found'; email: string };

export default function ForgotPasswordForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { login: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setFormError(null);

    try {
      const result = await requestPasswordReset({ login: values.login });

      setSubmitState(
        result.found
          ? {
              status: 'success',
              email: values.login,
              resetPath: result.resetPath,
            }
          : { status: 'not_found', email: values.login }
      );
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível enviar o link de redefinição'
      );
    }
  };

  if (submitState.status === 'success') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Conta encontrada
        </Typography>

        <Alert severity="success">
          Enviamos um link com validade de {RESET_PASSWORD_TOKEN_TTL_MINUTES} minutos para{' '}
          <strong>{submitState.email}</strong>.
        </Alert>

        <Typography variant="body2" color="text.secondary">
          Abra seu aplicativo de e-mail e clique no botão para escolher uma nova senha. Se não
          encontrar na caixa de entrada, verifique a pasta de spam ou lixo eletrônico.
        </Typography>

        {submitState.resetPath ? (
          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Ambiente de desenvolvimento (mock de e-mail):
            </Typography>
            <Typography
              component={Link}
              href={submitState.resetPath}
              variant="body2"
              sx={{ wordBreak: 'break-all', color: 'primary.main', fontWeight: 600 }}
            >
              Clique aqui para simular o link do e-mail
            </Typography>
          </Box>
        ) : null}

        <PillButton href="/login" tone="cta" fullWidth sx={{ minHeight: 44 }}>
          Voltar para o login
        </PillButton>
      </Stack>
    );
  }

  if (submitState.status === 'not_found') {
    return (
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Não encontramos essa conta
        </Typography>

        <Alert severity="warning">
          Nenhuma conta com o e-mail <strong>{submitState.email}</strong> foi localizada em nossa
          base.
        </Alert>

        <Typography variant="body2" color="text.secondary">
          Confira se digitou o endereço correto ou cadastre-se como apoiador ou missionário.
        </Typography>

        <PillButton
          onClick={() => setSubmitState({ status: 'idle' })}
          tone="primaryOutline"
          fullWidth
          sx={{ minHeight: 44 }}
        >
          Tentar outro e-mail
        </PillButton>

        <PillButton href="/select-role" tone="missionFlat" fullWidth sx={{ minHeight: 44 }}>
          Criar uma conta
        </PillButton>

        <PillButton href="/login" tone="outline" fullWidth sx={{ minHeight: 44 }}>
          Voltar para o login
        </PillButton>
      </Stack>
    );
  }

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body2" color="text.secondary">
        Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
      </Typography>

      {formError ? <Alert severity="error">{formError}</Alert> : null}

      <Controller
        name="login"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="E-mail"
            type="email"
            fullWidth
            placeholder="seu@email.com"
            autoComplete="email"
            error={Boolean(errors.login)}
            helperText={errors.login?.message}
            onChange={(event) => field.onChange(normalizeEmail(event.target.value))}
          />
        )}
      />

      <PillButton
        type="submit"
        tone="cta"
        fullWidth
        disabled={isSubmitting}
        sx={{ minHeight: 48, fontWeight: 600 }}
      >
        {isSubmitting ? 'Verificando…' : 'Enviar link'}
      </PillButton>

      <PillButton href="/login" tone="outline" fullWidth sx={{ minHeight: 44 }}>
        Voltar para o login
      </PillButton>
    </Stack>
  );
}
