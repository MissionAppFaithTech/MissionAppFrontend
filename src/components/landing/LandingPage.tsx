'use client';

import {
  Stack,
  Divider,
  Box,
  Container,
  Grid,
  Typography,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Avatar,
  Card,
  useTheme,
  type Theme,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Chip from '@mui/material/Chip';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import PillButton from '@/components/common/PillButton';
import SectionHeader from '@/components/common/SectionHeader';
import AudienceCard from '@/components/landing/AudienceCard';
import Logo from '@/components/common/Logo';
import BringMissionAppButton from '@/components/church/BringMissionAppButton';
import CampaignAdoptionGuide from '@/components/church/CampaignAdoptionGuide';
import { BRING_MISSION_APP_PATH, CHURCH_COUNCIL_PATH } from '@/lib/church/paths';
import { campaignPath, featuredCampaign } from '@/lib/campaigns/featured';

const LANDING_ICONS = {
  profile: '/icons/about-you.PNG',
  presentation: '/icons/your-space.PNG',
  embracing: '/icons/close.PNG',
  supporter: '/icons/supporter.PNG',
} as const;

const audienceCards = [
  {
    label: 'Para Igrejas & Conselhos missionários',
    title: 'Se você lidera a missão na igreja',
    accentColor: 'connection.main' as const,
    icon: LANDING_ICONS.embracing,
    benefit:
      'Adote as campanhas recorrentes com kit de mídia e QR Code prontos, fortaleça o conselho missionário e mantenha a congregação mobilizada o ano inteiro.',
  },
  {
    label: 'Para Missionários',
    title: 'Se você está na missão',
    accentColor: 'primary.main' as const,
    icon: LANDING_ICONS.presentation,
    benefit:
      'Divulgue seu ministério e seus projetos sociais, compartilhe atualizações, receba apoio em oração e fortaleça sua rede de mantenedores em um só lugar.',
  },
  {
    label: 'Para Apoiadores & Mobilizadores',
    title: 'Se você apoia alguém no campo',
    accentColor: 'supporter.main' as const,
    icon: LANDING_ICONS.supporter,
    benefit:
      'Conheça missionários e projetos sociais, ore com direcionamento, mobilize sua igreja para as campanhas e, se quiser, oferte com transparência.',
  },
];

/** The three pillars of the vision: campaigns, councils, missionaries and projects. */
const visionPillars = [
  {
    title: 'Campanhas missionárias recorrentes',
    icon: <CampaignIcon aria-hidden />,
    text: 'Campanhas temáticas que divulgam missionários e projetos sociais, com artes, vídeos de campo e dados de impacto prontos para o culto.',
  },
  {
    title: 'Conselhos missionários fortalecidos',
    icon: <GroupsIcon aria-hidden />,
    text: 'Um guia prático, cursos e modelos para a igreja estruturar o conselho missionário e mobilizar a congregação o ano inteiro.',
  },
  {
    title: 'Missionários e projetos para apoiar',
    icon: <VolunteerActivismIcon aria-hidden />,
    text: 'Conheça quem está no campo e as iniciativas sociais de cada campanha: acompanhe, ore junto e, se quiser, faça uma doação.',
  },
];

const footerLinks = [
  { label: 'Leve o Mission App para sua igreja', href: BRING_MISSION_APP_PATH },
  { label: 'Conselho missionário', href: CHURCH_COUNCIL_PATH },
  { label: 'Campanha vigente', href: campaignPath(featuredCampaign) },
  { label: 'Explorar missionários', href: '/navegacao' },
  { label: 'Perguntas frequentes', href: '/#faq' },
  { label: 'Entrar', href: '/login' },
];

const faqItems = [
  {
    question: 'O que são as campanhas missionárias recorrentes?',
    answer:
      'São campanhas temáticas que divulgam missionários e projetos sociais. Cada uma traz um kit de mídia para o culto, um Dia Oficial sugerido e uma página com QR Code para a igreja conhecer o projeto, orar e ofertar com transparência.',
  },
  {
    question: 'Como minha igreja adota uma campanha?',
    answer:
      'A liderança baixa o kit de mídia, reserva o Dia Oficial definido pelo Mission App e exibe o QR Code da campanha no culto. A página "Leve o Mission App para sua igreja" mostra o passo a passo, e o guia do conselho missionário ajuda a mobilizar a igreja o ano inteiro.',
  },
  {
    question: 'Como funciona o cadastro de missionários?',
    answer:
      'Após preencher seus dados e ministério, nossa equipe realiza a validação do seu perfil para garantir a segurança e autenticidade da comunidade.',
  },
  {
    question: 'Como os apoiadores podem contribuir com as missões?',
    answer:
      'Apoiadores podem ofertar em campanhas específicas, acompanhar relatórios de impacto e interagir diretamente com os pedidos de oração.',
  },
  {
    question: 'A plataforma cobra taxa sobre as ofertas enviadas?',
    answer:
      'O MissionApp prioriza o sustento missionário integral, aproximando você diretamente aos canais oficiais com total transparência e sem taxas abusivas.',
  },
  {
    question: 'Posso receber apoio em oração pela plataforma?',
    answer:
      'Sim. Você pode compartilhar pedidos de oração e manter seus apoiadores atualizados em tempo real sobre os desafios e testemunhos da missão.',
  },
  {
    question: 'O que são os Projetos de Impacto?',
    answer:
      'São causas estruturadas e ações sociais no campo que possuem metas claras, histórico de atividades, galeria de fotos e acompanhamento contínuo.',
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
  px: { xs: 2.5, md: 2.25 },
  fontSize: { xs: '0.9375rem', md: '0.96875rem' },
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
  // Scheme-driven, so the hero reads correctly on the very first paint.
  const headingPrimaryColor = 'var(--app-hero-ink)';

  return (
    <Stack
      spacing={0}
      sx={{
        width: '100%',
        // NOTE: wide enough for the two hero actions on one line from md up
        maxWidth: { xs: '36rem', md: 'min(52vw, 52rem)' },
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
        <Box component="span" sx={{ display: 'block', color: headingPrimaryColor }}>
          Campanhas
        </Box>
        <Box component="span" sx={{ display: 'block', color: 'accent.main' }}>
          missionárias
        </Box>
        <Box component="span" sx={{ display: 'block', color: headingPrimaryColor }}>
          que mobilizam
        </Box>
        <Box component="span" sx={{ display: 'block' }}>
          <Box component="span" sx={{ color: headingPrimaryColor }}>
            sua{' '}
          </Box>
          <Box component="span" sx={{ color: 'accent.main' }}>
            igreja
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
            bgcolor: 'accent.main',
          }}
        />

        <Stack
          spacing={2.5}
          sx={{
            width: '100%',
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Typography
            sx={{
              m: 0,
              maxWidth: '34rem',
              color: 'var(--app-hero-ink)',
              fontWeight: 500,
              lineHeight: 1.55,
              fontSize: { xs: '1rem', md: 'clamp(1rem, 0.6rem + 0.8vw, 1.3rem)' },
            }}
          >
            Plataforma de mobilização e conscientização missionária.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', md: 'flex-start' },
              '& > *': { width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' },
            }}
          >
            <BringMissionAppButton sx={heroCtaButtonSx} />
            {/* NOTE: two essential actions; the campaign in effect has its own section below */}
            {/* NOTE: filled navy (light blue in dark): as prominent as the orange, its own color */}
            <PillButton
              href={campaignPath(featuredCampaign)}
              tone="cta"
              startIcon={<CampaignIcon aria-hidden />}
              sx={{ ...heroCtaButtonSx, minHeight: 48, fontWeight: 700 }}
            >
              Explorar Campanha Missionária
            </PillButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

function LandingHero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        scrollMarginTop: { xs: '72px', md: '88px' },
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
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isDark ? 0.6 : 0.3,
          }}
        />
        {isDark && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(8, 28, 58, 0.7)',
              pointerEvents: 'none',
            }}
          />
        )}
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
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isDark ? 0.85 : 1,
            filter: isDark ? 'contrast(1.05) brightness(0.95)' : 'none',
          }}
        />
        {isDark && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(8, 28, 58, 0.94) 0%, rgba(8, 28, 58, 0.8) 42%, rgba(8, 28, 58, 0.35) 68%, rgba(8, 28, 58, 0.08) 100%)',
              pointerEvents: 'none',
            }}
          />
        )}
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
        <Container
          maxWidth={false}
          sx={{ ...landingContainerSx, width: '100%', pr: { md: '38%' } }}
        >
          <HeroHeadline />
        </Container>
      </Box>
    </Box>
  );
}

const landingCardSx = {
  p: { xs: 3, md: 4 },
  height: '100%',
  borderRadius: 3,
  bgcolor: 'background.paper',
  border: (theme: Theme) =>
    theme.palette.mode === 'dark'
      ? '1px solid var(--mui-palette-action2-borderSubtle)'
      : '1px solid var(--mui-palette-divider)',
  boxShadow: (theme: Theme) =>
    theme.palette.mode === 'dark' ? 'none' : '0 14px 28px rgba(13, 43, 92, 0.08)',
} as const;

const landingCardTitleSx = {
  fontWeight: 700,
  lineHeight: 1.3,
  fontSize: { xs: '1.125rem', md: '1.25rem' },
  color: (t: Theme) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
} as const;

/** The campaign in effect: banner, official day, projects, and how to take part. */
function FeaturedCampaignCard() {
  const campaign = featuredCampaign;
  const projects = campaign.associatedImpactProjects?.length ?? 0;

  return (
    <Card
      elevation={0}
      sx={{
        ...landingCardSx,
        p: 0,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: { xs: '100%', md: '45%' },
          minHeight: { xs: 200, sm: 260, md: 360 },
        }}
      >
        <Image
          src={campaign.bannerUrl}
          alt=""
          fill
          sizes="(min-width: 900px) 45vw, 100vw"
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <Stack spacing={2} sx={{ p: { xs: 3, md: 5 }, minWidth: 0, justifyContent: 'center' }}>
        <Chip
          icon={<CampaignIcon aria-hidden />}
          label="Campanha vigente"
          variant="outlined"
          sx={{
            alignSelf: 'flex-start',
            fontWeight: 700,
            // NOTE: accent is the orange that keeps 4.5:1 on the card in both themes
            color: 'accent.main',
            borderColor: 'accent.main',
            '& .MuiChip-icon': { color: 'accent.main' },
          }}
        />
        <Typography
          id="featured-campaign-heading"
          component="h3"
          sx={{ ...landingCardTitleSx, fontSize: { xs: '1.375rem', md: '1.75rem' } }}
        >
          {campaign.title}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {campaign.subtitle}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 3 }}
          useFlexGap
          sx={{ flexWrap: 'wrap' }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <EventIcon aria-hidden fontSize="small" sx={{ color: 'accent.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Dia oficial nas igrejas: {campaign.churchDay}
            </Typography>
          </Stack>
          {projects > 0 ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <VolunteerActivismIcon aria-hidden fontSize="small" sx={{ color: 'accent.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {projects === 1 ? '1 projeto de impacto' : `${projects} projetos de impacto`}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ pt: 1, '& > *': { width: { xs: '100%', sm: 'auto' } } }}
        >
          <PillButton
            href={campaignPath(campaign)}
            tone="primaryOutline"
            sx={{ minHeight: 48, px: 3, fontWeight: 600, justifyContent: 'center' }}
          >
            Ver a campanha
          </PillButton>
          <BringMissionAppButton />
        </Stack>
      </Stack>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <SiteHeader />

      <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
        <LandingHero />

        <Box
          id="objetivo"
          component="section"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={landingContainerSx}>
            <Stack spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
              <SectionHeader
                eyebrow="Nossa visão"
                title="Mobilização missionária contínua, de igreja em igreja."
                subtitle="O Mission App é uma plataforma de mobilização e conscientização missionária: campanhas recorrentes, conselhos missionários fortalecidos e missionários e projetos sociais para conhecer, orar e apoiar."
              />
              <Grid container spacing={3} sx={{ width: '100%' }}>
                {visionPillars.map((pillar) => (
                  <Grid key={pillar.title} size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={landingCardSx}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'accent.main',
                          bgcolor: 'var(--mui-palette-action2-secondaryHoverWash)',
                          mb: 2,
                        }}
                      >
                        {pillar.icon}
                      </Box>
                      <Typography component="h3" sx={landingCardTitleSx}>
                        {pillar.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                        {pillar.text}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Box>

        <Divider sx={{ width: '50%', mx: 'auto' }} />

        <Box
          id="campanha"
          component="section"
          aria-labelledby="featured-campaign-heading"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={landingContainerSx}>
            <Stack spacing={{ xs: 4, md: 5 }} sx={{ alignItems: 'center' }}>
              <SectionHeader
                eyebrow="Campanha vigente"
                title="Uma campanha por vez, toda a igreja junto."
                subtitle="A cada ciclo, uma campanha missionária reúne igrejas, missionários e apoiadores em torno de projetos sociais no campo."
              />
              <FeaturedCampaignCard />
            </Stack>
          </Container>
        </Box>

        <Divider sx={{ width: '50%', mx: 'auto' }} />

        <Box
          id="para-igrejas"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={{ ...landingContainerSx, maxWidth: { md: 1040 } }}>
            <CampaignAdoptionGuide
              campaign={featuredCampaign}
              variant="summary"
              headingId="landing-campaign-adoption-heading"
            />
          </Container>
        </Box>

        <Divider sx={{ width: '50%', mx: 'auto' }} />

        <Box
          id="explorar"
          component="section"
          aria-labelledby="explore-heading"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={landingContainerSx}>
            <Card
              elevation={0}
              sx={{
                ...landingCardSx,
                p: { xs: 3.5, sm: 5, md: 6 },
                borderRadius: 4,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'linear-gradient(135deg, rgba(13, 43, 92, 0.04) 0%, rgba(194, 65, 12, 0.06) 100%)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
                gap: 4,
              }}
            >
              <Box sx={{ maxWidth: 720 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'accent.main',
                    mb: 1,
                  }}
                >
                  Missionários e projetos sociais
                </Typography>
                <Typography
                  id="explore-heading"
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
                    fontWeight: 800,
                    lineHeight: 1.25,
                    mb: 1.5,
                    color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                  }}
                >
                  Explore missionários e projetos para orar e apoiar
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
                >
                  Conheça quem está no campo e as iniciativas sociais de cada campanha. Acompanhe a
                  jornada, ore junto e, se quiser, faça uma doação.
                </Typography>
              </Box>
              <Stack
                direction={{ xs: 'column', sm: 'row', md: 'column' }}
                spacing={2}
                useFlexGap
                sx={{ flexShrink: 0, '& > *': { width: { xs: '100%', sm: 'auto', md: '100%' } } }}
              >
                <PillButton
                  href="/navegacao"
                  tone="missionFilled"
                  sx={{ minHeight: 48, px: 3.5, fontWeight: 700, justifyContent: 'center' }}
                >
                  Explorar missionários e projetos
                </PillButton>
                <PillButton
                  href="/select-role"
                  tone="primaryOutline"
                  sx={{ minHeight: 48, px: 3.5, fontWeight: 600, justifyContent: 'center' }}
                >
                  Comece agora
                </PillButton>
              </Stack>
            </Card>
          </Container>
        </Box>

        <Divider sx={{ width: '50%', mx: 'auto' }} />

        <Box
          id="sobre"
          component="section"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={landingContainerSx}>
            <Stack spacing={{ xs: 8, md: 10, lg: 12 }}>
              {audienceCards.map((card, index) => (
                <AudienceCard
                  key={card.label}
                  {...card}
                  layout="row"
                  header={
                    index === 0 ? (
                      <SectionHeader
                        align="left"
                        eyebrow="Uma missão, três frentes"
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

        <Box
          id="como-funciona"
          component="section"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
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
                        border: (t) =>
                          t.palette.mode === 'dark'
                            ? '1px solid var(--mui-palette-action2-borderSubtle)'
                            : 'none',
                        boxShadow: (t) =>
                          t.palette.mode === 'dark'
                            ? 'var(--app-shadow-overlay)'
                            : `0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 14px 28px rgba(13, 43, 92, 0.1)`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: (t) =>
                            t.palette.mode === 'dark'
                              ? 'var(--app-shadow-overlay)'
                              : `0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 18px 32px rgba(13, 43, 92, 0.12)`,
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
                            // A fill behind white text needs the deep orange:
                            // the bright accent only reaches 2.8:1 with white.
                            bgcolor: 'mission.main',
                            boxShadow: 'var(--app-shadow-accent)',
                          }}
                        >
                          <Typography
                            sx={{
                              color: 'mission.contrastText',
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
                                color: (t) =>
                                  t.palette.mode === 'dark' ? 'common.white' : 'primary.main',
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

        <Box
          id="leve-para-sua-igreja"
          component="section"
          aria-labelledby="bring-cta-heading"
          sx={{ py: { xs: 6, md: 8 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
          <Container maxWidth={false} sx={landingContainerSx}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 5, md: 6 },
                borderRadius: 4,
                bgcolor: 'var(--app-footer-bg)',
                color: 'common.white',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box sx={{ maxWidth: 720 }}>
                <Typography
                  id="bring-cta-heading"
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
                    fontWeight: 800,
                    lineHeight: 1.25,
                    mb: 1.5,
                    color: 'common.white',
                  }}
                >
                  Sua igreja pode participar da próxima campanha
                </Typography>
                <Typography sx={{ lineHeight: 1.6, color: 'common.white' }}>
                  Kit de mídia, Dia Oficial e QR Code prontos: o conselho missionário só precisa
                  adotar a campanha e mobilizar a congregação.
                </Typography>
              </Box>
              <BringMissionAppButton sx={{ flexShrink: 0 }} />
            </Card>
          </Container>
        </Box>

        <Divider sx={{ width: '50%', mx: 'auto' }} />

        <Box
          id="faq"
          component="section"
          sx={{ py: { xs: 6, md: 10 }, scrollMarginTop: { xs: '72px', md: '88px' } }}
        >
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

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
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
                        minHeight: 44,
                      }}
                    >
                      Entre em contato
                    </PillButton>
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2}>
                  {faqItems.map((item) => (
                    <Accordion key={item.question}>
                      <AccordionSummary
                        expandIcon={<AddCircleIcon sx={{ color: 'primary.main' }} />}
                      >
                        <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary">{item.answer}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Box
        id="footer"
        component="footer"
        role="contentinfo"
        aria-label="Rodapé do site"
        sx={{
          py: { xs: 3, md: 4 },
          // `primary.dark` is a pale blue in dark mode; this stays a deep band.
          bgcolor: 'var(--app-footer-bg)',
          color: 'common.white',
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
            <Box component="nav" aria-label="Links do rodapé" sx={{ width: '100%' }}>
              <Stack
                component="ul"
                direction={{ xs: 'column', sm: 'row' }}
                useFlexGap
                spacing={{ xs: 0, sm: 3 }}
                sx={{ listStyle: 'none', p: 0, m: 0, flexWrap: 'wrap' }}
              >
                {footerLinks.map((link) => (
                  <Box component="li" key={link.href}>
                    <Box
                      component={Link}
                      href={link.href}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: 44,
                        color: 'common.white',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                        textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': { textDecorationColor: 'currentColor' },
                      }}
                    >
                      {link.label}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="caption" sx={{ textAlign: 'center', color: 'common.white' }}>
              © 2026 Mission App — plataforma de mobilização e conscientização missionária
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
