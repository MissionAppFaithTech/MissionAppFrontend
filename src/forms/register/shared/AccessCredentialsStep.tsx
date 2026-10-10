'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import { validateOnSubmit } from '@/lib/formValidation';
import { yieldToMain } from '@/lib/scheduler';
import type { AccessCredentialsValues } from '@/forms/register/types';
import { accessCredentialsSchema, type AccessCredentialsFormData } from '@/schemas/register.schema';
import { checkUsernameAvailability } from '@/services/username.service';
import { colors } from '@/theme/theme';

type AccessCredentialsStepProps = {
  defaultValues?: Partial<AccessCredentialsValues>;
  onSubmit: (values: AccessCredentialsValues) => void | Promise<void>;
  onBack: () => void;
  submitLabel?: string;
};

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

function isUsernameFormatValid(value: string) {
  return value.length >= 3 && value.length <= 32 && /^[a-z0-9_]+$/.test(value);
}

export default function AccessCredentialsStep({
  defaultValues,
  onSubmit,
  onBack,
  submitLabel = 'Continuar',
}: AccessCredentialsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AccessCredentialsFormData>({
    resolver: zodResolver(accessCredentialsSchema),
    ...validateOnSubmit,
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      ...defaultValues,
    },
  });

  const [username, password, confirmPassword] = watch(['username', 'password', 'confirmPassword']);
  const passwordsMismatch = Boolean(confirmPassword) && confirmPassword !== password;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const normalized = username.trim().toLowerCase();

    if (!isUsernameFormatValid(normalized)) {
      setUsernameStatus('idle');
      setSuggestions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    setUsernameStatus('checking');

    const timer = window.setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(normalized);
        if (requestId !== requestIdRef.current) return;

        if (result.available) {
          setUsernameStatus('available');
          setSuggestions([]);
          clearErrors('username');
          return;
        }

        setUsernameStatus('taken');
        setSuggestions(result.suggestions ?? []);
        setError('username', {
          type: 'validate',
          message: 'Este nome de usuário já está em uso',
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setUsernameStatus('error');
        setSuggestions([]);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [username, clearErrors, setError]);

  const applySuggestion = (suggestion: string) => {
    setValue('username', suggestion, { shouldDirty: true, shouldValidate: true });
  };

  const usernameHelperText = (() => {
    if (errors.username?.message) return errors.username.message;
    if (usernameStatus === 'checking') return 'Verificando disponibilidade…';
    if (usernameStatus === 'available') return 'Nome de usuário disponível';
    if (usernameStatus === 'taken') return 'Este nome de usuário já está em uso';
    if (usernameStatus === 'error') {
      return 'Não foi possível verificar o nome de usuário';
    }
    return undefined;
  })();

  const handleFormSubmit = async (values: AccessCredentialsFormData) => {
    if (usernameStatus === 'taken') {
      setError('username', {
        type: 'validate',
        message: 'Este nome de usuário já está em uso',
      });
      return;
    }
    setSubmitError(null);
    await yieldToMain();
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível concluir o cadastro');
    }
  };

  return (
    <RegisterStepForm
      onSubmit={handleSubmit(handleFormSubmit)}
      sectionTitle="Dados de acesso"
      onBack={onBack}
      submitLabel={submitLabel}
      submittingLabel="Finalizando..."
      isSubmitting={isSubmitting}
    >

      {submitError ? (
        <Box
          role="alert"
          aria-live="assertive"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'error.main',
            color: 'common.white',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {submitError}
        </Box>
      ) : null}

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome de usuário"
            fullWidth
            placeholder="exemplo_usuario"
            error={Boolean(errors.username) || usernameStatus === 'taken'}
            helperText={usernameHelperText}
            slotProps={{
              htmlInput: {
                autoComplete: 'username',
                autoCapitalize: 'none',
                spellCheck: false,
              },
              input: {
                endAdornment:
                  usernameStatus === 'idle' ? undefined : (
                    <InputAdornment position="end">
                      {usernameStatus === 'checking' ? (
                        <CircularProgress
                          color="inherit"
                          size={18}
                          aria-label="Verificando disponibilidade do nome de usuário"
                        />
                      ) : usernameStatus === 'available' ? (
                        <CheckIcon aria-hidden sx={{ fontSize: 20, color: colors.success }} />
                      ) : (
                        <CloseIcon aria-hidden sx={{ fontSize: 20, color: colors.error }} />
                      )}
                    </InputAdornment>
                  ),
              },
            }}
            onChange={(event) =>
              field.onChange(event.target.value.toLowerCase().replace(/\s/g, ''))
            }
          />
        )}
      />

      {suggestions.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Sugestões disponíveis — toque para usar:
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                clickable
                color="primary"
                variant="outlined"
                onClick={() => applySuggestion(suggestion)}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}

      <TextField
        {...register('password')}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Senha
          </Box>
        }
        type={showPassword ? 'text' : 'password'}
        fullWidth
        placeholder="Ex: Senha@123"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        slotProps={{
          htmlInput: {
            autoComplete: 'new-password',
            spellCheck: false,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                  size="medium"
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <PasswordStrengthIndicator password={password} />

      <TextField
        {...register('confirmPassword')}
        label="Confirmar senha"
        type={showConfirmPassword ? 'text' : 'password'}
        fullWidth
        placeholder="Repita a senha"
        error={Boolean(errors.confirmPassword) || passwordsMismatch}
        helperText={
          errors.confirmPassword?.message ??
          (passwordsMismatch ? 'As senhas precisam ser iguais' : undefined)
        }
        slotProps={{
          htmlInput: {
            autoComplete: 'new-password',
            spellCheck: false,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                  size="medium"
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

    </RegisterStepForm>
  );
}
