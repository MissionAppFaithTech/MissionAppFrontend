'use client';

import { Box, Stack, Typography, CardContent, Card } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
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
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        position: 'relative',
        outline: 'none',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Logo size="lg" />
        </Box>

        {roleLabel && (
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
        )}

        <Stack direction="column" spacing={2.5} sx={{ width: '100%', alignItems: 'stretch' }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 16px rgba(13, 43, 92, 0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 3.5 }, '&:last-child': { pb: { xs: 3, sm: 3.5 } } }}>
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2.5,
                  textAlign: 'left',
                }}
              >
                Acesse sua conta
              </Typography>
              <LoginForm />
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(13, 43, 92, 0.04)',
            }}
          >
            <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Ainda não tem uma conta?
                </Typography>
                <Typography
                  component={Link}
                  href="/select-role"
                  variant="body2"
                  sx={{
                    color: 'mission.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    minHeight: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Registre-se
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
