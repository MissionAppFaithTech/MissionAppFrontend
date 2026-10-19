'use client';

import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import LoginForm from '@/forms/LoginForm';

const roleLabels: Record<string, string> = {
  apoiador: 'Apoiador',
  missionario: 'Missionário',
  projeto: 'Projeto social',
};

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const roleLabel = role ? roleLabels[role] : null;

  return (
    <AuthLayout
      title="Acesse sua conta"
      footerPrompt="Ainda não tem uma conta?"
      footerActionLabel="Registre-se"
      footerActionHref="/select-role"
      header={
        roleLabel ? (
          <Stack
            direction="row"
            sx={{
              width: '100%',
              mb: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Entrar como {roleLabel}
            </Typography>

            <Typography
              component={Link}
              href="/select-role"
              variant="body2"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
            >
              Trocar perfil
            </Typography>
          </Stack>
        ) : null
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
