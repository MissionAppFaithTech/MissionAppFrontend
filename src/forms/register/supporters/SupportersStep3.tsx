"use client";

import RegistrationEmailConfirmation from "@/forms/register/shared/RegistrationEmailConfirmation";
import { useSupporterRegisterWizard } from "@/components/register/supporters/SupporterRegisterWizardContext";

export default function SupportersStep3() {
  const { formData } = useSupporterRegisterWizard();

  return <RegistrationEmailConfirmation email={formData.email} />;
}
