'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PillButton from '@/components/common/PillButton';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (_data: LoginFormData) => {
    setSubmitError(null);
    try {
      // Simula pequeno delay para feedback tátil/visual adequado
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push('/profile');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao autenticar');
    }
  };

  const togglePasswordVisibility = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const input = passwordInputRef.current;
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;

    setShowPassword((prev) => !prev);

    requestAnimationFrame(() => {
      const next = passwordInputRef.current;
      if (!next) return;
      next.focus({ preventScroll: true });
      next.setSelectionRange(start, end);
    });
  };

  const passwordRegistration = register('password');

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ width: '100%' }}
    >
      {submitError && (
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
      )}

      <TextField
        {...register('email')}
        label="E-mail"
        type="email"
        fullWidth
        placeholder="seu@email.com"
        autoComplete="email"
        disabled={isSubmitting}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />

      <TextField
        {...passwordRegistration}
        label="Senha"
        type="text"
        autoComplete="current-password"
        fullWidth
        placeholder="Sua senha"
        disabled={isSubmitting}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        slotProps={{
          htmlInput: {
            ref: (e: HTMLInputElement | null) => {
              passwordRegistration.ref(e);
              passwordInputRef.current = e;
            },
            spellCheck: false,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={togglePasswordVisibility}
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
        sx={{
          '& input': {
            ...(!showPassword
              ? {
                  WebkitTextSecurity: 'disc',
                }
              : null),
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 0.5 }}>
        <Typography
          component={Link}
          href="/forgot-password"
          variant="body2"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 500,
            py: 0.5,
            px: 1,
            borderRadius: 1,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            '&:hover': { textDecoration: 'underline' },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
            },
          }}
        >
          Esqueceu sua senha?
        </Typography>
      </Box>

      <PillButton
        type="submit"
        tone="cta"
        disabled={isSubmitting}
        fullWidth
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
            <CircularProgress size={20} color="inherit" />
            <span>Entrando...</span>
          </>
        ) : (
          'Entrar'
        )}
      </PillButton>
    </Stack>
  );
}
