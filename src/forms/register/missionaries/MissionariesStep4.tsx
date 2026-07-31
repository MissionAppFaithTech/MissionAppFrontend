"use client";

import RegistrationEmailConfirmation from "@/forms/register/shared/RegistrationEmailConfirmation";
import { useMissionaryRegisterWizard } from "@/components/register/missionaries/MissionaryRegisterWizardContext";

export default function MissionariesStep4() {
  const { formData } = useMissionaryRegisterWizard();

  return <RegistrationEmailConfirmation email={formData.email} />;
}
