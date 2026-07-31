'use client';

import { Box, Stack, Typography, Link, CardContent, Card } from '@mui/material';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import SupportersStep1 from '@/forms/register/supporters/SupportersStep1';
import SupportersStep2 from '@/forms/register/supporters/SupportersStep2';
import SupportersStep3 from '@/forms/register/supporters/SupportersStep3';
import {
  SupporterRegisterWizardProvider,
  useSupporterRegisterWizard,
} from '@/components/register/supporters/SupporterRegisterWizardContext';

const stepLabels = ['Dados pessoais', 'Dados de acesso', 'Confirmação'];

function SupportersRegisterContent() {
  const { step } = useSupporterRegisterWizard();
  const isConfirmation = step === 3;

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
          <Logo size="lg" />
        </Box>

        <Stack
          direction="row"
          sx={{
            mb: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Cadastro de apoiador</Typography>

          {!isConfirmation ? (
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
          ) : null}
        </Stack>

        {!isConfirmation ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Etapa {step} de 2 · {stepLabels[step - 1]}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }} />
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
              {step === 1 ? <SupportersStep1 /> : null}
              {step === 2 ? <SupportersStep2 /> : null}
              {step === 3 ? <SupportersStep3 /> : null}
            </CardContent>
          </Card>

          {!isConfirmation ? (
            <Typography align="center" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Já tem uma conta?{' '}
              <Link href="/login?role=apoiador" underline="hover" sx={{ color: 'text.primary' }}>
                Entrar
              </Link>
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

export default function SupportersPageContent() {
  return (
    <SupporterRegisterWizardProvider>
      <SupportersRegisterContent />
    </SupporterRegisterWizardProvider>
  );
}
