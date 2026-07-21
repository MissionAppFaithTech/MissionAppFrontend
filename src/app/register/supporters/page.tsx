import type { Metadata } from "next";
import { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import SupportersPageContent from "./SupportersPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cadastro de apoiador",
  description:
    "Crie sua conta de apoiador no Mission App e acompanhe missões e pedidos de oração.",
  alternates: { canonical: "/register/supporters" },
};

function SupportersFallback() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
}

export default function RegisterSupportersPage() {
  return (
    <Suspense fallback={<SupportersFallback />}>
      <SupportersPageContent />
    </Suspense>
  );
}
