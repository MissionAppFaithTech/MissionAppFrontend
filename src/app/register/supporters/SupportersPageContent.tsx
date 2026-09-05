'use client';

import { Box, Stack, Typography, CardContent, Card } from '@mui/material';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import RegistrationStepper from '@/components/register/RegistrationStepper';
import SupportersStep1 from '@/forms/register/supporters/SupportersStep1';
import SupportersStep2 from '@/forms/register/supporters/SupportersStep2';
import SupportersStep3 from '@/forms/register/supporters/SupportersStep3';
import {
  SupporterRegisterWizardProvider,
  useSupporterRegisterWizard,
} from '@/components/register/supporters/SupporterRegisterWizardContext';

const stepLabels = ['Dados pessoais', 'Dados de acesso'];

function SupportersRegisterContent() {
  const { step } = useSupporterRegisterWizard();
  const isConfirmation = step === 3;

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

        <Stack
          direction="row"
          sx={{
            width: '100%',
            mb: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Cadastro de apoiador
          </Typography>

          {!isConfirmation && (
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
          )}
        </Stack>

        {!isConfirmation && (
          <RegistrationStepper
            currentStep={step}
            totalSteps={2}
            stepLabels={stepLabels}
            tone="supporter"
          />
        )}

        <Stack direction="column" spacing={2.5} sx={{ width: '100%', alignItems: 'stretch' }}>
          <Card
            elevation={0}
            className="fade-in-entry"
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 16px rgba(13, 43, 92, 0.06)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 3.5 }, '&:last-child': { pb: { xs: 3, sm: 3.5 } } }}>
              {step === 1 && <SupportersStep1 />}
              {step === 2 && <SupportersStep2 />}
              {step === 3 && <SupportersStep3 />}
            </CardContent>
          </Card>

          {!isConfirmation && (
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
                    Já tem uma conta?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/login?role=apoiador"
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
                    Entrar
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
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
