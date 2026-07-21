import type { Metadata } from "next";
import RoleSelectionPage from "@/components/select-role/RoleSelectionPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Escolha seu perfil",
  description:
    "Selecione se você é missionário ou apoiador e comece a usar o Mission App.",
  alternates: { canonical: "/select-role" },
};

export default function SelectRolePage() {
  return <RoleSelectionPage />;
}
