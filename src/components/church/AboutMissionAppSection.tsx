'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';
import HandymanIcon from '@mui/icons-material/Handyman';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Pillar = { title: string; text: string; icon: ReactNode };

const PILLARS: Pillar[] = [
  {
    title: 'Visão',
    icon: <VisibilityIcon aria-hidden />,
    text: 'Igrejas locais mobilizadas o ano inteiro, com conselhos missionários fortalecidos e cada membro participando da missão de Deus nas nações.',
  },
  {
    title: 'Propósito',
    icon: <CampaignIcon aria-hidden />,
    text: 'Tirar do conselho missionário o peso de produzir materiais: entregar campanhas missionárias recorrentes com artes, vídeos de campo e dados de impacto, e aproximar a congregação de missionários e projetos sociais.',
  },
  {
    title: 'Ferramentas de mobilização',
    icon: <HandymanIcon aria-hidden />,
    text: 'Kit de mídia para o culto, QR Code da campanha, guia do conselho missionário, curso em vídeo e modelos de documentos: tudo pronto para a igreja usar.',
  },
];

type HowStep = { title: string; text: string; href?: string; linkLabel?: string };

const HOW_STEPS: HowStep[] = [
  {
    title: 'Apresente o Mission App à liderança',
    text: 'Compartilhe esta página com o pastor e o conselho missionário (ou a promotoria de missões).',
  },
  {
    title: 'Adote a campanha vigente',
    text: 'Baixe o kit de mídia, reserve o Dia Oficial definido pelo Mission App e exiba o QR Code no culto.',
    href: '#campanha-recorrente',
    linkLabel: 'Ver a campanha recorrente',
  },
  {
    title: 'Conecte a igreja aos missionários',
    text: 'Os membros criam uma conta de apoiador para orar, acompanhar e ofertar; os missionários da igreja publicam seu perfil e seus projetos.',
    href: '/select-role',
    linkLabel: 'Criar uma conta',
  },
  {
    title: 'Fortaleça o conselho missionário',
    text: 'Siga o guia com o passo a passo, as funções, o curso em vídeo e os modelos para estruturar o conselho missionário.',
    href: '/conselho-missionario#checklist',
    linkLabel: 'Aprender a fundar o conselho missionário',
  },
];

const cardSx = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 3,
  height: '100%',
  bgcolor: 'background.paper',
  border: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark'
      ? '1px solid var(--mui-palette-action2-borderSubtle)'
      : '1px solid var(--mui-palette-divider)',
  boxShadow: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(13, 43, 92, 0.05)',
} as const;

/**
 * "O que é o Mission App": vision, purpose and how a church brings the platform
 * in, before the council materials of the church guide.
 */
export default function AboutMissionAppSection() {
  return (
    <Box component="section" aria-labelledby="about-mission-app-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.08em', color: 'accent.main' }}
        >
          Conheça o Mission App
        </Typography>
        <Typography
          id="about-mission-app-heading"
          component="h2"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
            fontWeight: 800,
            lineHeight: 1.25,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          O que é o Mission App
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, maxWidth: 820, lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.05rem' } }}
        >
          Uma plataforma de mobilização e conscientização missionária. Por meio de campanhas
          missionárias recorrentes, divulga missionários e projetos sociais e entrega às igrejas
          ferramentas prontas para fortalecer seus conselhos missionários.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {PILLARS.map((pillar) => (
          <Grid key={pillar.title} size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={cardSx}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: 'accent.main', display: 'flex' }}>{pillar.icon}</Box>
                <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {pillar.title}
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {pillar.text}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography
        component="h3"
        sx={{
          mt: { xs: 4, md: 5 },
          mb: 2,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 700,
          color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
        }}
      >
        Como levar o Mission App para sua igreja
      </Typography>
      <Grid container component="ol" spacing={2.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {HOW_STEPS.map((step, index) => (
          <Grid key={step.title} component="li" size={{ xs: 12, sm: 6 }}>
            <Card elevation={0} sx={cardSx}>
              <Typography
                aria-hidden
                sx={{ color: 'accent.main', fontWeight: 800, fontSize: '1.25rem', mb: 0.5 }}
              >
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Typography component="h4" sx={{ fontWeight: 700, mb: 0.75 }}>
                {step.title}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {step.text}
              </Typography>
              {step.href ? (
                <Link
                  href={step.href}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 44,
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {step.linkLabel}
                </Link>
              ) : null}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
