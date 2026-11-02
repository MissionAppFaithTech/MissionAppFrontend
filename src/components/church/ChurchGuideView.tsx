'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PillButton from '@/components/common/PillButton';
import InteractiveChecklist from './InteractiveChecklist';
import CouncilRolesGrid from './CouncilRolesGrid';
import MobilizationTimeline from './MobilizationTimeline';
import MaterialsHub from './MaterialsHub';
import CopyableTemplatesSection from './CopyableTemplatesSection';
import ChurchVideoPlaylistSection from './ChurchVideoPlaylistSection';

const guideSections = [
  { id: 'checklist', label: '1. Passo a Passo', icon: <ChecklistIcon fontSize="small" /> },
  { id: 'funcoes', label: '2. Funções do Conselho', icon: <GroupsIcon fontSize="small" /> },
  { id: 'curso-video', label: '3. Curso em Vídeo', icon: <OndemandVideoIcon fontSize="small" /> },
  { id: 'cadencia', label: '4. Mobilização Anual', icon: <CalendarMonthIcon fontSize="small" /> },
  { id: 'materiais', label: '5. Hub de Agências', icon: <LibraryBooksIcon fontSize="small" /> },
  { id: 'templates', label: '6. Modelos Copiáveis', icon: <ContentCopyIcon fontSize="small" /> },
];

export default function ChurchGuideView() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const targetSection = guideSections[newValue];
    if (targetSection) {
      const el = document.getElementById(targetSection.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Breadcrumb / Back button */}
        <Box sx={{ mb: 3 }}>
          <PillButton
            href="/"
            tone="primaryOutline"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{ minHeight: 40, px: 2, fontSize: '0.8125rem', fontWeight: 600 }}
          >
            Voltar para o início
          </PillButton>
        </Box>

        {/* Hero Header */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            mb: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'linear-gradient(135deg, rgba(13, 43, 92, 0.04) 0%, rgba(194, 65, 12, 0.06) 100%)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid var(--mui-palette-action2-borderSubtle)'
                : '1px solid var(--mui-palette-divider)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(194, 65, 12, 0.2)' : 'rgba(194, 65, 12, 0.1)',
              color: 'accent.main',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Guia Prático para Igrejas Locais
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
              mb: 2,
            }}
          >
            Guia Prático do Conselho Missionário & Mobilização da Igreja
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
              maxWidth: 820,
              mb: 3.5,
            }}
          >
            Um passo a passo completo para igrejas criarem seu <strong>Conselho Missionário</strong>{' '}
            (ou Promotoria de Missões) e mobilizarem a congregação o ano inteiro, com frameworks e
            materiais oficiais da <strong>JMM</strong>, <strong>JMN</strong>, <strong>APMT</strong>{' '}
            e <strong>Perspectivas Brasil</strong>.
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              '& > *': {
                width: { xs: '100%', md: 'auto' },
              },
            }}
          >
            <PillButton
              href="#checklist"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' });
                setActiveTab(0);
              }}
              tone="missionFilled"
              sx={{ minHeight: 44, px: 3, fontWeight: 700 }}
            >
              Começar Checklist
            </PillButton>

            <PillButton
              href="#curso-video"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('curso-video')?.scrollIntoView({ behavior: 'smooth' });
                setActiveTab(2);
              }}
              tone="cta"
              sx={{ minHeight: 44, px: 3, fontWeight: 600 }}
            >
              Assistir Curso em Vídeo
            </PillButton>

            <PillButton
              href="#templates"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                setActiveTab(5);
              }}
              tone="primaryOutline"
              sx={{ minHeight: 44, px: 3, fontWeight: 600 }}
            >
              Ver Modelos de Documentos
            </PillButton>
          </Stack>
        </Card>

        {/* Quick-Nav Sticky Tabs */}
        <Box
          sx={{
            position: 'sticky',
            top: { xs: 56, sm: 64 },
            zIndex: 10,
            bgcolor: 'background.default',
            pt: 1,
            pb: 2,
            mb: 4,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Navegação rápida entre as seções do guia"
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: 'accent.main',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                  fontWeight: 700,
                },
              },
            }}
          >
            {guideSections.map((sec, idx) => (
              <Tab
                key={sec.id}
                icon={sec.icon}
                iconPosition="start"
                label={sec.label}
                id={`guide-tab-${idx}`}
                aria-controls={`guide-section-${sec.id}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* Sections Content */}
        <Stack spacing={{ xs: 6, md: 8 }}>
          {/* Section 1: Checklist */}
          <Box id="checklist" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <InteractiveChecklist />
          </Box>

          <Divider />

          {/* Section 2: Roles */}
          <Box id="funcoes" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <CouncilRolesGrid />
          </Box>

          <Divider />

          {/* Section 3: Video Playlist Course */}
          <Box id="curso-video" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <ChurchVideoPlaylistSection />
          </Box>

          <Divider />

          {/* Section 4: Mobilization Cadence */}
          <Box id="cadencia" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <MobilizationTimeline />
          </Box>

          <Divider />

          {/* Section 5: Materials Hub */}
          <Box id="materiais" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <MaterialsHub />
          </Box>

          <Divider />

          {/* Section 6: Copyable Templates */}
          <Box id="templates" sx={{ scrollMarginTop: { xs: '120px', md: '140px' } }}>
            <CopyableTemplatesSection />
          </Box>

          {/* Bottom Action Card */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 5 },
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid var(--mui-palette-action2-borderSubtle)'
                  : '1px solid var(--mui-palette-divider)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' ? 'none' : '0 8px 30px rgba(13, 43, 92, 0.08)',
              textAlign: 'center',
            }}
          >
            <Typography
              component="h3"
              sx={{
                fontSize: { xs: '1.35rem', md: '1.75rem' },
                fontWeight: 700,
                color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                mb: 1.5,
              }}
            >
              Pronto para Conectar Sua Igreja à Missão Global?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 650, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}
            >
              O Mission App centraliza atualizações do campo, cartas de oração e sustentação de
              projetos em um ambiente moderno e transparente.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              useFlexGap
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                '& > *': {
                  width: { xs: '100%', sm: 'auto' },
                },
              }}
            >
              <PillButton
                href="/select-role"
                tone="missionFilled"
                sx={{ minHeight: 44, px: 3.5, fontWeight: 700 }}
              >
                Cadastre sua igreja ou missionários
              </PillButton>
              <PillButton
                href="/"
                tone="primaryOutline"
                sx={{ minHeight: 44, px: 3, fontWeight: 600 }}
              >
                Voltar à página inicial
              </PillButton>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
