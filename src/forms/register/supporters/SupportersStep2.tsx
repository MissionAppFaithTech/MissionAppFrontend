"use client";

import AccessCredentialsStep from "@/forms/register/shared/AccessCredentialsStep";
import { useSupporterRegisterWizard } from "@/components/register/supporters/SupporterRegisterWizardContext";

export default function SupportersStep2() {
  const { formData, completeStep2, goBack } = useSupporterRegisterWizard();

  return (
    <AccessCredentialsStep
      defaultValues={formData}
      onSubmit={completeStep2}
      onBack={goBack}
      submitLabel="Finalizar cadastro"
    />
  );
}
