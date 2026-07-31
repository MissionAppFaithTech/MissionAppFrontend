import type { Metadata } from "next";
import SupportersPageContent from "./SupportersPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cadastro de apoiador",
  description:
    "Crie sua conta de apoiador no Mission App e acompanhe missões e pedidos de oração.",
  alternates: { canonical: "/register/supporters" },
};

export default function RegisterSupportersPage() {
  return <SupportersPageContent />;
}
