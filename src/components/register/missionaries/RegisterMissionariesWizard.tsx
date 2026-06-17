"use client";

import { Box, Stack, Typography, Link, CardContent, Card } from "@mui/material";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/common/Logo";
import MissionariesStep1 from "@/forms/register/missionaries/MissionariesStep1";
import MissionariesStep2 from "@/forms/register/missionaries/MissionariesStep2";
import MissionariesStep3 from "@/forms/register/missionaries/MissionariesStep3";
import MissionariesStep4 from "@/forms/register/missionaries/MissionariesStep4";
import {
  MissionaryRegisterWizardProvider,
  useMissionaryRegisterWizard,
} from "@/components/register/missionaries/MissionaryRegisterWizardContext";

const stepLabels = ["Dados pessoais", "Dados de missão", "Dados de acesso", "Confirmação"];

function RegisterMissionariesWizardContent() {
  const { step } = useMissionaryRegisterWizard();

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

      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Box sx={{ mb: 3 }}>
          <Logo size="md" />
        </Box>

        <Stack
          direction="row"
          sx={{
            mb: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Cadastro de missionário</Typography>

          <Link
            href="/select-role"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Trocar perfil
          </Link>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Etapa {step} de 4 · {stepLabels[step - 1]}
        </Typography>

        <Stack direction="column" spacing={2} sx={{ width: "100%", alignItems: "stretch" }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              bgcolor: "transparent",
              boxShadow: "none",
            }}
          >
            <CardContent>
              {step === 1 ? <MissionariesStep1 /> : null}
              {step === 2 ? <MissionariesStep2 /> : null}
              {step === 3 ? <MissionariesStep3 /> : null}
              {step === 4 ? <MissionariesStep4 /> : null}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

export default function RegisterMissionariesWizard() {
  return (
    <MissionaryRegisterWizardProvider>
      <RegisterMissionariesWizardContent />
    </MissionaryRegisterWizardProvider>
  );
}
