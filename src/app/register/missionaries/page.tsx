import type { Metadata } from "next";
import RegisterMissionariesWizard from "@/components/register/missionaries/RegisterMissionariesWizard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cadastro de missionário",
  description:
    "Crie sua conta de missionário no Mission App e conecte-se com apoiadores.",
  alternates: { canonical: "/register/missionaries" },
};

export default function RegisterMissionariesPage() {
  return <RegisterMissionariesWizard />;
}
