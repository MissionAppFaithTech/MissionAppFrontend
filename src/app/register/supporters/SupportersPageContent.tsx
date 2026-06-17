'use client';

import { Box, Button, Stack, Typography, Link, CardContent, Card } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import LoginForm from '@/forms/LoginForm';
import GoogleIcon from '@mui/icons-material/Google';

const roleLabels: Record<string, string> = {
  apoiador: 'Apoiador',
  missionario: 'Missionário',
  projeto: 'Projeto social',
};

export default function SupportersPageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const roleLabel = role ? roleLabels[role] : null;

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ mb: 3 }}>
          <Logo size="md" />
        </Box>

        {roleLabel && (
          <Stack
            direction="row"
            sx={{
              mb: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Entrar como {roleLabel}</Typography>

            <Link
              href="/select-role"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Trocar perfil
            </Link>
          </Stack>
        )}

        <Stack direction="column" spacing={2} sx={{ width: '100%', alignItems: 'stretch' }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              bgcolor: 'transparent',
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack direction="column" spacing={2} sx={{ width: '100%', alignItems: 'stretch' }}>
                <LoginForm />
                <Typography align="center" sx={{ color: 'text.secondary' }}>
                  ou
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon sx={{ fontSize: 18, color: '#FBD7C6' }} />}
                  sx={{
                    alignSelf: 'center',
                    px: 3,
                    py: 1,
                    backgroundColor: '#FAFBFC',
                    borderColor: '#E5E7EB',
                    color: '#3C4043',
                    textTransform: 'none',
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                      borderColor: '#D1D5DB',
                    },
                  }}
                >
                  Entrar com Google
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              bgcolor: 'transparent',
              boxShadow: 'none',
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Typography sx={{ color: 'text.secondary' }}>Ainda não tem uma conta? </Typography>
                <Link href="/register">
                  {' '}
                  <Typography sx={{ color: 'text.primary' }}> Registre-se</Typography>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
