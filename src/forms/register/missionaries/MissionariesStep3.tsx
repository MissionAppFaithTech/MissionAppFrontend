'use client';

import AccessCredentialsStep from '@/forms/register/shared/AccessCredentialsStep';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

export default function MissionariesStep3() {
  const { formData, completeStep3, goBack } = useMissionaryRegisterWizard();

  return (
    <AccessCredentialsStep
      defaultValues={formData}
      onSubmit={completeStep3}
      onBack={goBack}
      submitLabel="Finalizar cadastro"
    />
  );
}
