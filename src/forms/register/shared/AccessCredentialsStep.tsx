'use client';

import { useState } from 'react';
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
import { validateOnLeave } from '@/lib/formValidation';
import { signupFieldErrors } from '@/forms/register/shared/fieldErrors';
import { yieldToMain } from '@/lib/scheduler';
import type { AccessCredentialsValues } from '@/forms/register/types';
import { accessCredentialsSchema, type AccessCredentialsFormData } from '@/schemas/register.schema';
import {
  usernameAvailabilityHelper,
  useUsernameAvailability,
} from '@/hooks/useUsernameAvailability';
import { colors } from '@/theme/theme';

type AccessCredentialsStepProps = {
  defaultValues?: Partial<AccessCredentialsValues>;
  onSubmit: (values: AccessCredentialsValues) => void | Promise<void>;
  onBack: () => void;
  submitLabel?: string;
  /** Position of this step in its wizard, announced with the heading. */
  progress?: { step: number; total: number };
};

const CREDENTIAL_FIELDS = ['username', 'password', 'confirmPassword'] as const;

export default function AccessCredentialsStep({
  defaultValues,
  onSubmit,
  onBack,
  submitLabel = 'Continuar',
  progress,
}: AccessCredentialsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<AccessCredentialsFormData>({
    resolver: zodResolver(accessCredentialsSchema),
    ...validateOnLeave,
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      ...defaultValues,
    },
  });

  // NOTE: "As senhas precisam ser iguais" comes from the schema when the user leaves
  // the confirmation field, not on every key press.
  const [username, password] = watch(['username', 'password']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverErrorCount, setServerErrorCount] = useState(0);
  const { status: usernameStatus, suggestions } = useUsernameAvailability({
    username,
    onTaken: () =>
      setError('username', {
        type: 'validate',
        message: 'Este nome de usuário já está em uso',
      }),
    onAvailable: () => clearErrors('username'),
  });

  const applySuggestion = (suggestion: string) => {
    setValue('username', suggestion, { shouldDirty: true, shouldValidate: true });
  };

  const usernameHelperText = usernameAvailabilityHelper(usernameStatus, errors.username?.message);

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
      // Fields of this step rejected by the API show on the field, like any other error.
      const fieldErrors = signupFieldErrors(error);
      const rejected = CREDENTIAL_FIELDS.filter((field) => fieldErrors[field]);
      if (rejected.length > 0) {
        rejected.forEach((field) =>
          setError(field, { type: 'server', message: fieldErrors[field] })
        );
        setServerErrorCount((count) => count + 1);
        return;
      }
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível concluir o cadastro'
      );
    }
  };

  return (
    <RegisterStepForm
      onSubmit={handleSubmit(handleFormSubmit)}
      sectionTitle="Dados de acesso"
      progress={progress}
      errors={errors}
      submitCount={submitCount}
      serverErrorCount={serverErrorCount}
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
            required
            fullWidth
            placeholder="exemplo_usuario"
            error={Boolean(errors.username) || usernameStatus === 'taken'}
            helperText={usernameHelperText}
            slotProps={{
              htmlInput: {
                autoComplete: 'username',
                autoCapitalize: 'none',
                autoCorrect: 'off',
                spellCheck: false,
                enterKeyHint: 'next',
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
                aria-label={`Usar nome de usuário ${suggestion}`}
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
        required
        fullWidth
        placeholder="Ex: Senha@123"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        slotProps={{
          htmlInput: {
            autoComplete: 'new-password',
            spellCheck: false,
            enterKeyHint: 'next',
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Mostrar senha"
                  aria-pressed={showPassword}
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
        required
        fullWidth
        placeholder="Repita a senha"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        slotProps={{
          htmlInput: {
            autoComplete: 'new-password',
            spellCheck: false,
            enterKeyHint: 'done',
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Mostrar confirmação de senha"
                  aria-pressed={showConfirmPassword}
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
