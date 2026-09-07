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
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PillButton from '@/components/common/PillButton';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import { yieldToMain } from '@/lib/scheduler';
import type { AccessCredentialsValues } from '@/forms/register/types';
import { accessCredentialsSchema, type AccessCredentialsFormData } from '@/schemas/register.schema';
import { checkUsernameAvailability } from '@/services/username.service';

type AccessCredentialsStepProps = {
  defaultValues?: Partial<AccessCredentialsValues>;
  onSubmit: (values: AccessCredentialsValues) => void;
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
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      ...defaultValues,
    },
  });

  const [username, password] = watch(['username', 'password']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
      return 'Verificação online indisponível no momento (ok enquanto o back não estiver ligado).';
    }
    return 'Use letras minúsculas, números e _';
  })();

  const handleFormSubmit = async (values: AccessCredentialsFormData) => {
    if (usernameStatus === 'taken') {
      setError('username', {
        type: 'validate',
        message: 'Este nome de usuário já está em uso',
      });
      return;
    }
    await yieldToMain();
    onSubmit(values);
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body1">Dados de acesso</Typography>

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
                  usernameStatus === 'checking' ? (
                    <CircularProgress
                      color="inherit"
                      size={18}
                      aria-label="Verificando disponibilidade do nome de usuário"
                    />
                  ) : undefined,
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
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        placeholder="Ex: Senha@123"
        error={Boolean(errors.password)}
        helperText={
          errors.password?.message ??
          'Use maiúscula, minúscula, número e caractere especial (mín. 8)'
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
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
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

      <Stack direction="row" spacing={2}>
        <PillButton
          type="button"
          tone="primarySoftOutline"
          onClick={onBack}
          fullWidth
          sx={{ minHeight: 48, fontSize: '1rem', fontWeight: 500 }}
        >
          Voltar
        </PillButton>
        <PillButton
          type="submit"
          tone="cta"
          fullWidth
          disabled={isSubmitting}
          sx={{
            minHeight: 48,
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" aria-label="Enviando cadastro" />
              <span>Finalizando...</span>
            </>
          ) : (
            submitLabel
          )}
        </PillButton>
      </Stack>
    </Stack>
  );
}
