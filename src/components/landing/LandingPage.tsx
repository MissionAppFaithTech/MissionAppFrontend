"use client";

import { Stack, Divider, Box, Container, Grid, Paper, Typography } from "@mui/material";
import Image from "next/image";
import SiteHeader from "@/components/layout/SiteHeader";
import PillButton from "@/components/common/PillButton";
import SectionHeader from "@/components/common/SectionHeader";
import AudienceCard from "@/components/landing/AudienceCard";
import AppStoreBadges from "@/components/landing/AppStoreBadges";
import { brandGradient } from "@/theme/theme";

const audienceCards = [
  {
    label: "Para Missionários",
    title: "Se você está na missão",
    accentColor: "primary.main" as const,
    mockupVariant: "missionary" as const,
    benefits: [
      "Compartilhe atualizações facilmente",
      "Receba apoio em oração",
      "Fortaleça sua rede de mantenedores",
      "Mantenha todos conectados em um só lugar",
    ],
  },
  {
    label: "Para Apoiadores",
    title: "Se você apoia alguém no campo",
    accentColor: "supporter.main" as const,
    mockupVariant: "supporter" as const,
    benefits: [
      "Acompanhe a jornada missionária",
      "Receba pedidos de oração",
      "Contribua com mais proximidade",
      "Veja o impacto da sua participação",
    ],
  },
];

const steps = [
  {
    step: "1",
    title: "Conte quem você é",
    description:
      "Apoiador ou missionário — escolha o perfil que combina com a sua história.",
  },
  {
    step: "2",
    title: "Monte seu espaço",
    description:
      "Em poucos minutos, crie um perfil onde sua missão ou seu apoio possam viver.",
  },
  {
    step: "3",
    title: "Fique perto de quem importa",
    description:
      "Compartilhe, acompanhe, ore junto e contribua — tudo no mesmo lugar.",
  },
];

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SiteHeader />

      <Box id="inicio" component="section">
        <Image
          src="/landing-page/landing-page.png"
          alt="MissionApp conectando missionários e apoiadores ao redor do mundo"
          width={800}
          height={800}
          priority
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      <Box id="objetivo" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={4} sx={{ alignItems: "center" }}>
            <SectionHeader
              eyebrow="Nossa missão"
              title="Conectamos missionários e apoiadores em um só lugar."
              subtitle="Acompanhe histórias, compartilhe avanços, ore junto e fortaleça relacionamentos que sustentam a missão."
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <PillButton href="/select-role">Quero fazer parte</PillButton>
              <PillButton href="#sobre" tone="outline">
                Conhecer melhor
              </PillButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Divider />

      <Box
        id="sobre"
        component="section"
        sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F7F2EC" }}
      >
        <Container maxWidth="lg">
          <Stack spacing={5} sx={{ alignItems: "center" }}>
            <SectionHeader
              eyebrow="Para quem é"
              title="Dois lados da mesma missão."
              subtitle="O MissionApp aproxima quem vai e quem envia."
            />

            <Grid container spacing={3}>
              {audienceCards.map((card) => (
                <Grid key={card.label} size={{ xs: 12, md: 6 }}>
                  <AudienceCard {...card} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Paper
        elevation={0}
        sx={{
          py: 4,
          background: brandGradient,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontStyle: "italic", color: "white" }}>
          &ldquo;Ide por todo o mundo e pregai o Evangelho a toda criatura.&rdquo;
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 1, color: "white", opacity: 0.8 }}>
          — Mc 16:15
        </Typography>
      </Paper>

      <Box id="como-funciona" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={5} sx={{ alignItems: "center" }}>
            <SectionHeader
              eyebrow="Como funciona"
              title="Comece sua jornada em poucos minutos."
              subtitle="Crie seu perfil, conecte-se e compartilhe aquilo que Deus está fazendo através da sua missão."
            />

            <Grid container spacing={3}>
              {steps.map(({ step, title, description }) => (
                <Grid key={step} size={{ xs: 12, md: 4 }}>
                  <Stack
                    spacing={1.5}
                    sx={{
                      textAlign: "center",
                      px: 2,
                      py: 3,
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{ color: "mission.main", fontWeight: 800, lineHeight: 1 }}
                    >
                      {step}
                    </Typography>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Box
        id="comecar"
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: "primary.dark",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth='lg'>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              © 2026 MissionApp
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
