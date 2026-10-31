'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PillButton from '@/components/common/PillButton';
import { validateOnSubmit, withLiveEmailFormat } from '@/lib/formValidation';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { postLoginPath } from '@/lib/auth/redirect';
import { login } from '@/services/auth.service';
import { clearUserStores } from '@/stores/sessionStore';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

type LoginErrorInfo = {
  title: string;
  description: string;
};

function parseLoginError(errorMessage: string): LoginErrorInfo {
  const lower = errorMessage.toLowerCase();
  if (
    lower.includes('invalid') ||
    lower.includes('credentials') ||
    lower.includes('credenciais') ||
    lower.includes('e_invalid_credentials') ||
    lower.includes('incorret')
  ) {
    return {
      title: 'E-mail ou senha incorretos',
      description:
        'Verifique os dados digitados e tente novamente. Se você esqueceu sua senha, utilize a recuperação de acesso logo abaixo.',
    };
  }
  if (lower.includes('locked') || lower.includes('bloqueada')) {
    return {
      title: 'Conta temporariamente bloqueada',
      description:
        'Por segurança, o acesso foi pausado após várias tentativas inválidas. Aguarde alguns instantes ou redefina sua senha.',
    };
  }
  if (lower.includes('not found') || lower.includes('não encontrad')) {
    return {
      title: 'Conta não localizada',
      description:
        'Não encontramos nenhuma conta com o e-mail informado. Verifique o endereço digitado ou cadastre-se.',
    };
  }
  if (
    lower.includes('conexão') ||
    lower.includes('servidor') ||
    lower.includes('network') ||
    lower.includes('fetch')
  ) {
    return {
      title: 'Erro de conexão',
      description:
        'Não foi possível comunicar com o servidor. Verifique sua conexão com a internet e tente novamente.',
    };
  }
  return {
    title: 'Não foi possível entrar',
    description: errorMessage || 'Verifique seus dados e tente novamente.',
  };
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'expired';
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<LoginErrorInfo | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    clearErrors,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    ...validateOnSubmit,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      const { user } = await login({ login: data.email, password: data.password });
      // Drop anything cached for a previous user before entering the new session.
      clearUserStores();
      router.push(postLoginPath(user.role, searchParams.get('next')));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao autenticar';
      setSubmitError(parseLoginError(message));
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
      {sessionExpired && !submitError ? (
        <Alert severity="info" role="status">
          Sua sessão expirou. Entre novamente para continuar de onde parou.
        </Alert>
      ) : null}
      {submitError && (
        <Alert
          severity="error"
          role="alert"
          aria-live="assertive"
          icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 22, mt: '2px' }} />}
          sx={{ width: '100%' }}
        >
          <Typography
            variant="subtitle2"
            component="div"
            sx={{ fontWeight: 700, color: 'inherit', mb: 0.5, lineHeight: 1.3 }}
          >
            {submitError.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'inherit', lineHeight: 1.5 }}>
            {submitError.description}
          </Typography>
        </Alert>
      )}

      <TextField
        {...withLiveEmailFormat(register('email'), { trigger, clearErrors, getFieldState })}
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
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    color: 'text.secondary',
                    transition: 'color 0.2s ease, background-color 0.2s ease, transform 0.15s ease',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.05)',
                    },
                  }}
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
            fontWeight: 600,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'color 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              color: 'connection.main',
              backgroundColor: 'action.hover',
              textDecoration: 'none',
            },
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
        sx={{
          ...FORM_ACTION_BUTTON_SX,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={16} color="inherit" />
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <LoginIcon sx={{ fontSize: 18 }} />
            <span>Entrar</span>
          </>
        )}
      </PillButton>
    </Stack>
  );
}
