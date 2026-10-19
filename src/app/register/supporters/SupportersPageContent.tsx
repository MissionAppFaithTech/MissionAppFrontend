'use client';

import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthLayout from '@/components/common/AuthLayout';
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
    <AuthLayout
      logoSize="md"
      className="fade-in-entry"
      title="Cadastro de apoiador"
      titleAction={
        isConfirmation ? undefined : (
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
              flexShrink: 0,
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            Trocar perfil
          </Typography>
        )
      }
      footerPrompt={isConfirmation ? undefined : 'Já tem uma conta?'}
      footerActionLabel="Entrar"
      footerActionHref="/login?role=apoiador"
    >
      {!isConfirmation && (
        <RegistrationStepper
          currentStep={step}
          totalSteps={2}
          stepLabels={stepLabels}
          tone="supporter"
        />
      )}
      {step === 1 && <SupportersStep1 />}
      {step === 2 && <SupportersStep2 />}
      {step === 3 && <SupportersStep3 />}
    </AuthLayout>
  );
}

export default function SupportersPageContent() {
  return (
    <SupporterRegisterWizardProvider>
      <SupportersRegisterContent />
    </SupporterRegisterWizardProvider>
  );
}
