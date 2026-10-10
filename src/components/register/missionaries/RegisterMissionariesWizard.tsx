'use client';

import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthLayout from '@/components/common/AuthLayout';
import RegistrationStepper from '@/components/register/RegistrationStepper';
import MissionariesStep1 from '@/forms/register/missionaries/MissionariesStep1';
import MissionariesStep2 from '@/forms/register/missionaries/MissionariesStep2';
import MissionariesStep3 from '@/forms/register/missionaries/MissionariesStep3';
import MissionariesStep4 from '@/forms/register/missionaries/MissionariesStep4';
import {
  MissionaryRegisterWizardProvider,
  useMissionaryRegisterWizard,
} from '@/components/register/missionaries/MissionaryRegisterWizardContext';

const stepLabels = ['Dados pessoais', 'Dados ministeriais', 'Dados de acesso'];

function RegisterMissionariesWizardContent() {
  const { step } = useMissionaryRegisterWizard();
  const isConfirmation = step === 4;

  return (
    <AuthLayout
      logoSize="md"
      className="fade-in-entry"
      title="Cadastro de missionário"
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
      footerActionHref="/login?role=missionario"
    >
      {!isConfirmation && (
        <RegistrationStepper
          currentStep={step}
          totalSteps={3}
          stepLabels={stepLabels}
          tone="mission"
        />
      )}
      {step === 1 && <MissionariesStep1 />}
      {step === 2 && <MissionariesStep2 />}
      {step === 3 && <MissionariesStep3 />}
      {step === 4 && <MissionariesStep4 />}
    </AuthLayout>
  );
}

export default function RegisterMissionariesWizard() {
  return (
    <MissionaryRegisterWizardProvider>
      <RegisterMissionariesWizardContent />
    </MissionaryRegisterWizardProvider>
  );
}
