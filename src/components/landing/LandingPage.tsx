'use client';

import { Stack, Divider, Box, Container, Grid, Typography, AccordionDetails, Accordion, AccordionSummary, Avatar } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import PillButton from '@/components/common/PillButton';
import SectionHeader from '@/components/common/SectionHeader';
import AudienceCard from '@/components/landing/AudienceCard';
import Logo from '@/components/common/Logo';

const LANDING_ICONS = {
  profile: '/icons/about-you.PNG',
  presentation: '/icons/your-space.PNG',
  embracing: '/icons/close.PNG',
  supporter: '/icons/supporter.PNG',
  world: '/icons/world.PNG',
} as const;

const audienceCards = [
  {
    label: 'Para Missionários',
    title: 'Se você está na missão',
    accentColor: 'primary.main' as const,
    mockupVariant: 'missionary' as const,
    icon: LANDING_ICONS.presentation,
    benefit:
      'Compartilhe atualizações facilmente, receba apoio em oração, fortaleça sua rede de mantenedores e mantenha todos conectados em um só lugar.',
  },
  {
    label: 'Para Apoiadores',
    title: 'Se você apoia alguém no campo',
    accentColor: 'supporter.main' as const,
    mockupVariant: 'supporter' as const,
    icon: LANDING_ICONS.supporter,
    benefit:
      'Conecte-se à missão de forma mais próxima: acompanhe a jornada missionária, receba pedidos de oração e veja como sua participação faz a diferença na vida de pessoas ao redor do mundo.',
  },
];

const steps = [
  {
    step: '01',
    titleLines: ['Conte quem', 'você é'],
    icon: LANDING_ICONS.profile,
    description: 'Apoiador ou missionário — escolha o perfil que combina com a sua história.',
  },
  {
    step: '02',
    titleLines: ['Monte seu', 'espaço'],
    icon: LANDING_ICONS.presentation,
    description: 'Em poucos minutos, crie um perfil onde sua missão ou seu apoio possam viver.',
  },
  {
    step: '03',
    titleLines: ['Fique perto', 'de quem importa'],
    icon: LANDING_ICONS.embracing,
    description: 'Compartilhe, acompanhe, ore junto e contribua — tudo no mesmo lugar.',
  },
];

/** Shared horizontal layout for landing page sections and navbar */
const landingContainerSx = {
  px: { xs: 2, sm: 3, md: 3, lg: 4 },
  maxWidth: { md: 1280, lg: 1440, xl: 1600 },
  mx: 'auto',
} as const;

const heroCtaButtonSx = {
  flexShrink: 0,
  py: { xs: 0.75, md: 0.875 },
  px: { xs: 2.5, md: 3 },
  fontSize: { xs: "0.9375rem", md: "1rem" },
  fontWeight: 600,
  minHeight: 44,
} as const;

/** Navbar height — content centers in the hero area below this on desktop */
const HERO_NAVBAR_HEIGHT = { xs: 64, md: 80 } as const;

/** Pulls the hero image under the transparent navbar on desktop */
const HERO_NAVBAR_OVERLAP = {
  xs: `-${HERO_NAVBAR_HEIGHT.xs}px`,
  md: `-${HERO_NAVBAR_HEIGHT.md}px`,
} as const;

function HeroHeadline() {
  return (
    <Stack
      spacing={0}
      sx={{
        width: '100%',
        maxWidth: { xs: '36rem', md: 'min(48vw, 52rem)' },
        mx: { xs: 'auto', md: 0 },
        alignItems: { xs: 'center', md: 'flex-start' },
        textAlign: { xs: 'center', md: 'left' },
        gap: { xs: 'clamp(1.25rem, 2.5vw, 3rem)', md: 'clamp(1rem, 2.2vw, 2.5rem)' },
        pointerEvents: 'auto',
      }}
    >
      <Typography
        component="h1"
        sx={{
          m: 0,
          fontWeight: 700,
          lineHeight: { xs: 1.1, md: 1.12 },
          letterSpacing: '-0.02em',
          textAlign: { xs: 'center', md: 'left' },
          fontSize: {
            xs: 'clamp(2rem, 1rem + 5vw, 2.75rem)',
            md: 'clamp(1.65rem, 0.65rem + 2.75vw, 4.75rem)',
          },
        }}
      >
        <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
          Conectando
        </Box>
        <Box component="span" sx={{ display: 'block' }}>
          <Box component="span" sx={{ color: 'mission.main' }}>
            missionários
          </Box>
          <Box component="span" sx={{ color: 'primary.main' }}>
            {' '}
            e
          </Box>
        </Box>
        <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
          apoiadores ao
        </Box>
        <Box component="span" sx={{ display: 'block' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            redor do{' '}
          </Box>
          <Box component="span" sx={{ color: 'mission.main' }}>
            mundo
          </Box>
        </Box>
      </Typography>

      <Stack
        sx={{
          width: '100%',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: { xs: 'clamp(2rem, 3vw, 4rem)', md: 'clamp(2rem, 2.8vw, 3.5rem)' },
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: { xs: 'clamp(2.5rem, 4vw, 4rem)', md: 'clamp(2rem, 2vw, 3rem)' },
            height: { xs: 'clamp(3px, 0.3vw, 4px)', md: 'clamp(2px, 0.25vw, 3px)' },
            borderRadius: 1,
            bgcolor: 'mission.main',
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          <PillButton
            href="/select-role"
            tone="missionFlat"
            sx={heroCtaButtonSx}
          >
            Comece agora
          </PillButton>
          <PillButton
            href="#como-funciona"
            tone="primaryOutline"
            sx={heroCtaButtonSx}
          >
            Saiba mais
          </PillButton>
        </Stack>
      </Stack>
    </Stack>
  );
}

function LandingHero() {
  return (
    <Box
      id="inicio"
      component="section"
      sx={{
        mt: { xs: HERO_NAVBAR_OVERLAP.xs, md: HERO_NAVBAR_OVERLAP.md },
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'stretch' },
        minHeight: { xs: '100svh', md: 480 },
        height: { xs: '100svh', md: '100svh' },
        py: { xs: 0, md: 0 },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'absolute',
          inset: 0,
        }}
      >
        <Image
          src="/landing-page/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.3 }}
        />
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          inset: 0,
        }}
      >
        <Image
          src="/landing-page/landing-page.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: { xs: HERO_NAVBAR_HEIGHT.xs, md: HERO_NAVBAR_HEIGHT.md },
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-start' },
          width: '100%',
          pointerEvents: { md: 'none' },
        }}
      >
        <Container maxWidth={false} sx={{ ...landingContainerSx, width: '100%', pr: { md: '38%' } }}>
          <HeroHeadline />
        </Container>
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SiteHeader />

      <LandingHero />

      <Box id="objetivo" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth={false} sx={landingContainerSx}>
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <SectionHeader
              eyebrow="Nossa missão"
              title="Conectamos missionários e apoiadores em um só lugar."
              subtitle="Acompanhe histórias, compartilhe avanços, ore junto e fortaleça relacionamentos que sustentam a missão."
            />
          </Stack>
        </Container>
      </Box>

      <Divider sx={{ width: '50%', mx: 'auto' }} />

      <Box id="sobre" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth={false} sx={landingContainerSx}>
          <Stack spacing={{ xs: 8, md: 10, lg: 12 }}>
            {audienceCards.map((card, index) => (
              <AudienceCard
                key={card.label}
                {...card}
                layout="row"
                imagePosition={index === 0 ? 'right' : 'left'}
                header={
                  index === 0 ? (
                    <SectionHeader
                      align="left"
                      eyebrow="Dois lados da mesma missão"
                      title="Para quem é?"
                    />
                  ) : undefined
                }
              />
            ))}
          </Stack>
        </Container>
      </Box>

      <Divider sx={{ width: '50%', mx: 'auto' }} />

      <Box id="como-funciona" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth={false} sx={landingContainerSx}>
          <Stack spacing={5} sx={{ alignItems: 'center' }}>
            <SectionHeader
              eyebrow="Como funciona"
              title="Comece sua jornada em poucos minutos."
              subtitle="Crie seu perfil, conecte-se e compartilhe aquilo que Deus está fazendo através da sua missão."
            />

            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {steps.map(({ step, titleLines, icon, description }) => (
                <Grid
                  key={step}
                  size={{ xs: 12, sm: 6, md: 4 }}
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}
                >
                  <Stack
                    spacing={2.5}
                    sx={{
                      width: '100%',
                      maxWidth: { xs: 300, md: 350 },
                      height: '100%',
                      px: { xs: 4, md: 5 },
                      py: { xs: 4, md: 5 },
                      minHeight: { xs: 300, md: 350 },
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      border: 'none',
                      boxShadow: `
                        0 1px 0 rgba(255, 255, 255, 0.95) inset,
                        0 14px 28px rgba(13, 43, 92, 0.1)
                      `,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `
                          0 1px 0 rgba(255, 255, 255, 0.95) inset,
                          0 18px 32px rgba(13, 43, 92, 0.12)
                        `,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: 'transparent',
                      }}
                    >
                      <Image src={icon} alt="" width={100} height={100} />
                    </Avatar>

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: 'stretch',
                        justifyContent: 'left',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          alignSelf: 'stretch',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          bgcolor: 'rgba(251, 146, 60, 0.28)',
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'mission.dark',
                            fontWeight: 800,
                            lineHeight: 1,
                            fontSize: '1.5rem',
                          }}
                        >
                          {step}
                        </Typography>
                      </Box>
                      <Stack sx={{ justifyContent: 'center', textAlign: 'left' }}>
                        {titleLines.map((line) => (
                          <Typography
                            key={line}
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.2,
                              fontSize: { xs: '1.125rem', md: '1.25rem' },
                              color: 'primary.main',
                            }}
                          >
                            {line}
                          </Typography>
                        ))}
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.55,
                        fontSize: { xs: '0.9375rem', md: '1rem' },
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      {description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Divider sx={{ width: '50%', mx: 'auto' }} />

      <Box id="faq" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth={false} sx={landingContainerSx}>
          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
                <SectionHeader
                  eyebrow="Perguntas frequentes"
                  title="Tudo o que você precisa saber."
                  subtitle="Reunimos as principais dúvidas para ajudar você a utilizar a plataforma com confiança e tranquilidade."
                />
                <Stack spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Box
                    component="img"
                    src="/images/faq-illustration.PNG"
                    alt="Perguntas frequentes"
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      mx: 'auto',
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center' }}
                  >
                    Continua com dúvida?
                  </Typography>
                  <PillButton
                    href="/select-role"
                    tone="missionFlat"
                    size="small"
                    sx={{
                      py: 0.5,
                      px: 2,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      minHeight: 36,
                    }}
                  >
                    Entre em contato
                  </PillButton>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2}>
                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Como funciona o cadastro de missionários?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Após enviar seus dados, nossa equipe realiza uma análise e entra em contato
                      por e-mail com a aprovação, solicitação de informações adicionais ou
                      reprovação.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Como funciona o cadastro de missionários?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Após enviar seus dados, nossa equipe realiza uma análise e entra em contato
                      por e-mail com a aprovação, solicitação de informações adicionais ou
                      reprovação.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Como funciona o cadastro de missionários?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Após enviar seus dados, nossa equipe realiza uma análise e entra em contato
                      por e-mail com a aprovação, solicitação de informações adicionais ou
                      reprovação.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Como funciona o cadastro de missionários?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Após enviar seus dados, nossa equipe realiza uma análise e entra em contato
                      por e-mail com a aprovação, solicitação de informações adicionais ou
                      reprovação.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Como funciona o cadastro de missionários?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Após enviar seus dados, nossa equipe realiza uma análise e entra em contato
                      por e-mail com a aprovação, solicitação de informações adicionais ou
                      reprovação.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Posso receber apoio em oração pela plataforma?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      Sim. Você pode compartilhar pedidos de oração e manter seus apoiadores
                      atualizados sobre sua jornada missionária.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        id="footer"
        component="section"
        sx={{
          py: { xs: 3, md: 4 },
          bgcolor: 'primary.dark',
          color: 'white',
        }}
      >
        <Container maxWidth={false} sx={landingContainerSx}>
          <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Logo size="lg" variant="dark" />
            <Typography
              variant="body2"
              sx={{ fontStyle: 'italic', color: 'white', textAlign: 'left', lineHeight: 1.6 }}
            >
              &ldquo;Ide por todo o mundo e pregai o Evangelho a toda criatura.&rdquo; — Mc 16:15
            </Typography>
            <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="caption" sx={{ opacity: 0.75, textAlign: 'center' }}>
              © 2026 MissionApp
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
