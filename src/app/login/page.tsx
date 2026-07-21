import type { Metadata } from "next";
import { Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LoginPageContent from "./LoginPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no Mission App para acompanhar missões, oração e apoio.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

function LoginFallback() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
