"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import PillButton from "@/components/common/PillButton";
import ThemeToggle from "@/components/ThemeToggle";
import AppStoreBadges from "@/components/landing/AppStoreBadges";

const roles = [
  { label: "Sou um apoiador", href: "/login?role=apoiador" },
  { label: "Sou um missionário", href: "/login?role=missionario" },
  /*{ label: "Sou um projeto social", href: "/login?role=projeto" },*/
] as const;

export default function RoleSelectionPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 6,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>
      <Stack spacing={5} sx={{ width: "100%", maxWidth: 400, alignItems: "center" }}>
        <Logo size="xl" />

        <Typography align="center" sx={{ color: "text.secondary" }}>
          Como você quer usar o Mission app?
        </Typography>

        <Stack spacing={2.5} sx={{ width: "100%" }}>
          {roles.map(({ label, href }) => (
            <PillButton key={href} href={href} fullWidth>
              {label}
            </PillButton>
          ))}
        </Stack>

        <Typography
          component={Link}
          href="/"
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            fontSize: "0.65rem",
            "&:hover": {
              color: "connection.main",
              textDecoration: "underline",
            },
          }}
        >
          Voltar para a página inicial
        </Typography>
      </Stack>
    </Box>
  );
}
