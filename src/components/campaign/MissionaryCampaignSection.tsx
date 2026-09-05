'use client';

import { useState } from 'react';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import CampaignBadge from '@/components/campaign/CampaignBadge';
import CampaignMediaCarousel from '@/components/campaign/CampaignMediaCarousel';
import CampaignVideoPlayer from '@/components/campaign/CampaignVideoPlayer';
import DonationModal from '@/components/profile/DonationModal';
import type { CampaignData } from '@/types/campaign';

type MissionaryCampaignSectionProps = {
  campaign?: CampaignData | null;
  missionaryName?: string;
  isOwnProfile?: boolean;
};

export default function MissionaryCampaignSection({
  campaign,
  missionaryName = 'Samuel Mendonça',
  isOwnProfile = false,
}: MissionaryCampaignSectionProps) {
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Informative Empty State when missionary has no active campaign (RF 10.4)
  if (!campaign) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 480, mx: 'auto' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(230, 81, 0, 0.08)',
                color: 'mission.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CampaignIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              Nenhuma campanha ativa no momento
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              As Campanhas de Divulgação são criadas e promovidas oficialmente pela administração e
              avaliadores do Mission App para mobilizar igrejas e impulsionar projetos de impacto.
              Quando um projeto deste missionário for associado a uma campanha oficial, ela será
              exibida aqui com todos os detalhes e ações de apoio.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const handleShare = async () => {
    const campaignUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/campanha/${campaign.id}`
        : `/campanha/${campaign.id}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.subtitle,
          url: campaignUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(campaignUrl);
      setToastMessage('Link da campanha copiado para a área de transferência!');
    }
  };

  return (
    <>
      <Card
        component="section"
        aria-label="Campanha Missionária"
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            {/* Header com Selo e Ação de Compartilhar */}
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <CampaignBadge label={campaign.badge || 'Selo Oficial de Campanha'} />

              <PillButton
                tone="primaryOutline"
                size="small"
                onClick={handleShare}
                aria-label="Compartilhar campanha"
                sx={{ fontSize: '0.8125rem', py: 0.5, px: 1.75 }}
              >
                <ShareOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                Compartilhar
              </PillButton>
            </Stack>

            {/* 1. Título e Subtítulo da Campanha (O Título vem primeiro) */}
            <Stack spacing={1}>
              <Typography
                variant="h5"
                component="h2"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
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
                    fontSize: { xs: '0.9375rem', sm: '1.05rem' },
                    lineHeight: 1.5,
                  }}
                >
                  {campaign.subtitle}
                </Typography>
              )}
            </Stack>

            {/* 2. Carrossel Rotativo de Imagens da Campanha */}
            {campaign.images && campaign.images.length > 0 && (
              <CampaignMediaCarousel images={campaign.images} title={campaign.title} />
            )}

            {/* 3. Detalhes e Descrição da Campanha */}
            <Stack spacing={1.5}>
              {campaign.churchDay && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'rgba(13, 43, 92, 0.04)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    width: 'fit-content',
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                  >
                    Dia Oficial nas Igrejas: {campaign.churchDay}
                  </Typography>
                </Stack>
              )}

              <Typography
                variant="body1"
                color="text.primary"
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  lineHeight: 1.7,
                  pt: 0.5,
                  whiteSpace: 'pre-line',
                }}
              >
                {campaign.description}
              </Typography>
            </Stack>

            {/* 4. Vídeo da Campanha */}
            {campaign.videoUrl && (
              <CampaignVideoPlayer videoUrl={campaign.videoUrl} title={campaign.title} />
            )}

            <Divider sx={{ my: 0.5 }} />

            {/* Botões de Ação Principais: Ofertar e Página da Campanha */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              {/* Botão OFERTAR */}
              <PillButton
                tone="missionFilled"
                size="medium"
                onClick={() => setDonationModalOpen(true)}
                aria-label="Ofertar na campanha"
                sx={{
                  minHeight: 46,
                  px: 3.5,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  bgcolor: 'mission.main',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'mission.dark' },
                  boxShadow: '0 3px 10px rgba(230, 81, 0, 0.28)',
                }}
              >
                <VolunteerActivismIcon sx={{ fontSize: 20, mr: 1 }} />
                Ofertar
              </PillButton>

              {/* Botão Página da Campanha */}
              <PillButton
                component={Link}
                href={`/campanha/${campaign.id}`}
                tone="primarySoftOutline"
                size="medium"
                aria-label="Ver Página da Campanha"
                sx={{
                  minHeight: 46,
                  px: 3,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(13, 43, 92, 0.05)',
                  },
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 18, mr: 1 }} />
                Ver Página da Campanha
              </PillButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal de Ofertar */}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={missionaryName}
        isOwnProfile={isOwnProfile}
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
    </>
  );
}
