'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LaunchIcon from '@mui/icons-material/Launch';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import CampaignBadge from '@/components/campaign/CampaignBadge';
import CampaignMediaCarousel from '@/components/campaign/CampaignMediaCarousel';
import CampaignVideoPlayer from '@/components/campaign/CampaignVideoPlayer';
import DonationModal from '@/components/profile/DonationModal';
import type { CampaignData } from '@/types/campaign';

type CampaignDetailViewProps = {
  campaign: CampaignData;
};

export default function CampaignDetailView({ campaign }: CampaignDetailViewProps) {
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedMissionary, setSelectedMissionary] = useState(
    campaign.missionaryName || 'Samuel Mendonça'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copiado para a área de transferência!');
    }
  };

  const handleScrollToProjects = () => {
    const element = document.getElementById('projetos-associados');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{ bgcolor: 'background.default', pb: { xs: 8, md: 10 }, outline: 'none' }}
    >
      {/* 1. Banner Principal Hero (RF 13.3) */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 220, sm: 340, md: 420 },
          bgcolor: 'primary.dark',
          overflow: 'hidden',
        }}
      >
        <Image
          src={campaign.bannerUrl || '/landing-page/landing-page.png'}
          alt={campaign.title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(13, 43, 92, 0.92) 0%, rgba(13, 43, 92, 0.45) 60%, rgba(13, 43, 92, 0.2) 100%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            pb: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={1.5} sx={{ maxWidth: 840 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <CampaignBadge label={campaign.badge} />
              {campaign.churchDay && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    color: 'common.white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 16 }} />
                  <span>Dia Oficial nas Igrejas: {campaign.churchDay}</span>
                </Stack>
              )}
            </Box>

            <Typography
              variant="h3"
              component="h1"
              color="common.white"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '2.25rem', md: '2.75rem' },
                lineHeight: 1.2,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              {campaign.title}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* 2. Container Central */}
      <Container
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, mt: { xs: -2, sm: -3 }, position: 'relative', zIndex: 2 }}
      >
        <Grid container spacing={3}>
          {/* Coluna Principal */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 14px rgba(13, 43, 92, 0.1)',
                  p: { xs: 2.5, sm: 3.5 },
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Stack spacing={3}>
                    {/* Título e Subtítulo da Campanha (Título vem primeiro) */}
                    <Stack spacing={1}>
                      <Typography
                        variant="h5"
                        component="h2"
                        color="primary.main"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '1.25rem', sm: '1.65rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {campaign.title}
                      </Typography>
                      {campaign.subtitle && (
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                            lineHeight: 1.5,
                          }}
                        >
                          {campaign.subtitle}
                        </Typography>
                      )}
                    </Stack>

                    {/* Carrossel de Fotos da Campanha */}
                    {campaign.images && campaign.images.length > 0 && (
                      <CampaignMediaCarousel images={campaign.images} title={campaign.title} />
                    )}

                    {/* Descrição Completa (RF 13.3 - até 1.500 palavras) */}
                    <Stack spacing={1.5}>
                      <Typography
                        variant="subtitle2"
                        color="primary.main"
                        sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}
                      >
                        Sobre esta Campanha
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{
                          fontSize: { xs: '0.9375rem', sm: '1.025rem' },
                          lineHeight: 1.8,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {campaign.description}
                      </Typography>
                    </Stack>

                    {/* Vídeo Oficial (RF 13.3) */}
                    {campaign.videoUrl && (
                      <CampaignVideoPlayer videoUrl={campaign.videoUrl} title={campaign.title} />
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* 3. Seção de Projetos de Impacto Associados (RF 13.2 / 13.4.2) */}
              <Box id="projetos-associados" sx={{ pt: 1 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: { xs: 2, sm: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 14px rgba(13, 43, 92, 0.1)',
                    p: { xs: 2.5, sm: 3.5 },
                    bgcolor: 'background.paper',
                  }}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack spacing={2.5}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <Typography
                            variant="h6"
                            component="h2"
                            color="primary.main"
                            sx={{ fontWeight: 800 }}
                          >
                            Projetos de Impacto Vinculados (
                            {campaign.associatedImpactProjects?.length ?? 0})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Conheça e apoie os missionários que atuam diretamente nos objetivos
                            desta campanha.
                          </Typography>
                        </div>
                      </Stack>

                      <Stack spacing={2}>
                        {campaign.associatedImpactProjects &&
                        campaign.associatedImpactProjects.length > 0 ? (
                          campaign.associatedImpactProjects.map((project) => (
                            <Card
                              key={project.id}
                              variant="outlined"
                              sx={{
                                borderRadius: 2.5,
                                borderColor: 'divider',
                                p: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  boxShadow: '0 4px 12px rgba(13, 43, 92, 0.08)',
                                },
                              }}
                            >
                              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      width: '100%',
                                      aspectRatio: '16 / 10',
                                      borderRadius: 2,
                                      overflow: 'hidden',
                                      bgcolor: 'surface.main',
                                    }}
                                  >
                                    <Image
                                      src={project.imageUrl}
                                      alt={project.title}
                                      fill
                                      sizes="(max-width: 600px) 100vw, 300px"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 8 }}>
                                  <Stack spacing={1}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                                    >
                                      <CampaignBadge label={campaign.badge} size="small" />
                                      {project.missionaryName && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Missionário: {project.missionaryName}
                                        </Typography>
                                      )}
                                    </Stack>

                                    <Typography
                                      variant="subtitle1"
                                      color="primary.main"
                                      sx={{ fontWeight: 700, lineHeight: 1.3 }}
                                    >
                                      {project.title}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {project.description}
                                    </Typography>

                                    <Stack
                                      direction={{ xs: 'column', sm: 'row' }}
                                      spacing={1}
                                      sx={{ pt: 0.5, alignItems: { xs: 'stretch', sm: 'center' } }}
                                    >
                                      <PillButton
                                        tone="missionFilled"
                                        size="small"
                                        onClick={() => {
                                          if (project.missionaryName) {
                                            setSelectedMissionary(project.missionaryName);
                                          }
                                          setDonationModalOpen(true);
                                        }}
                                        sx={{
                                          fontSize: '0.8125rem',
                                          fontWeight: 700,
                                          minHeight: 44,
                                          py: 0.5,
                                          px: 2,
                                          bgcolor: 'mission.main',
                                          color: 'common.white',
                                          '&:hover': { bgcolor: 'mission.dark' },
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <VolunteerActivismIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        Ofertar
                                      </PillButton>

                                      {project.missionaryUsername && (
                                        <PillButton
                                          component={Link}
                                          href={`/user/${project.missionaryUsername}`}
                                          tone="primarySoftOutline"
                                          size="small"
                                          sx={{
                                            fontSize: '0.8125rem',
                                            minHeight: 44,
                                            py: 0.5,
                                            px: 2,
                                            justifyContent: 'center',
                                          }}
                                        >
                                          Ver Perfil
                                        </PillButton>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Card>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum projeto de impacto vinculado a esta campanha no momento.
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Grid>

          {/* Barra Lateral / Sidebar Sticky */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 90 } }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 14px rgba(13, 43, 92, 0.1)',
                  p: { xs: 2.5, sm: 3 },
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Stack spacing={2.5}>
                    {/* Cabeçalho Institucional da Campanha (RF 13.1 / 13.3) */}
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(194, 65, 12, 0.08)',
                          color: 'mission.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1.5px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <CampaignIcon sx={{ fontSize: 26, color: 'mission.main' }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', mb: 0.25, flexWrap: 'wrap' }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="primary.main"
                            sx={{ fontWeight: 800, lineHeight: 1.2 }}
                          >
                            Campanha Oficial
                          </Typography>
                          <CampaignBadge label={campaign.badge || 'Oficial'} size="small" />
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          Mission App Brasil · Mobilização Nacional
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    {/* Datas Oficiais (RF 13.1 / 13.3) */}
                    <Stack spacing={1.5}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Informações do Ciclo
                      </Typography>

                      {campaign.churchDay && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                          <CalendarMonthIcon
                            sx={{ color: 'mission.main', fontSize: 20, mt: 0.2 }}
                          />
                          <div>
                            <Typography variant="caption" color="text.secondary">
                              Dia nas Igrejas
                            </Typography>
                            <Typography
                              variant="body2"
                              color="primary.main"
                              sx={{ fontWeight: 700 }}
                            >
                              {campaign.churchDay}
                            </Typography>
                          </div>
                        </Stack>
                      )}

                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <EventAvailableIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.2 }} />
                        <div>
                          <Typography variant="caption" color="text.secondary">
                            Período de Vigência
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            {campaign.startDate} até {campaign.endDate}
                          </Typography>
                        </div>
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* Ações Primárias */}
                    <Stack spacing={1.5}>
                      {/* Botão OFERTAR */}
                      <PillButton
                        tone="missionFilled"
                        size="medium"
                        onClick={() => {
                          setSelectedMissionary(campaign.title || 'Campanha Oficial');
                          setDonationModalOpen(true);
                        }}
                        aria-label="Ofertar na campanha"
                        sx={{
                          minHeight: 48,
                          fontSize: '1rem',
                          fontWeight: 700,
                          bgcolor: 'mission.main',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'mission.dark' },
                          boxShadow: '0 3px 12px rgba(230, 81, 0, 0.3)',
                        }}
                      >
                        <VolunteerActivismIcon sx={{ fontSize: 22, mr: 1 }} />
                        Ofertar na Campanha
                      </PillButton>

                      {/* Botão Ir para a Seção de Projetos de Impacto (RF 13.3) */}
                      <PillButton
                        tone="primaryOutline"
                        size="medium"
                        onClick={handleScrollToProjects}
                        sx={{
                          minHeight: 44,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        }}
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 18, mr: 0.75 }} />
                        Ir para Projetos de Impacto
                      </PillButton>

                      {/* Botão de Compartilhar (RF 13.3 / 13.5) */}
                      <PillButton
                        tone="primarySoftOutline"
                        size="medium"
                        onClick={handleShare}
                        sx={{ minHeight: 44, fontSize: '0.875rem', fontWeight: 600 }}
                      >
                        <ShareOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                        Compartilhar Campanha
                      </PillButton>

                      {/* Botão de Redirecionamento Externo (RF 13.3) */}
                      {campaign.redirectUrl && (
                        <PillButton
                          component="a"
                          href={campaign.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          tone="primarySoftOutline"
                          size="medium"
                          sx={{ minHeight: 44, fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          <LaunchIcon sx={{ fontSize: 18, mr: 0.75 }} />
                          Acessar Link Oficial
                        </PillButton>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Modal de Ofertar */}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={selectedMissionary}
        isOwnProfile={false}
      />

      {/* Snackbar Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              color: 'common.white',
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
