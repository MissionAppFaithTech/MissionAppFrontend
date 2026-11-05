'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import EventIcon from '@mui/icons-material/Event';
import MovieIcon from '@mui/icons-material/Movie';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import CampaignQrCode from '@/components/campaign/CampaignQrCode';
import PillButton from '@/components/common/PillButton';
import BringMissionAppButton from '@/components/church/BringMissionAppButton';
import { campaignPath } from '@/lib/campaigns/featured';
import type { CampaignData } from '@/types/campaign';

/** Items of the mission service media kit. `href` stays empty until the files exist. */
export const MEDIA_KIT_ITEMS = [
  {
    id: 'slides',
    title: 'Slides do culto',
    format: 'Apresentação 16:9',
    description: 'Abertura, dados do campo e o chamado para ofertar, prontos para o telão.',
    icon: <SlideshowIcon aria-hidden />,
    href: undefined as string | undefined,
  },
  {
    id: 'video',
    title: 'Vídeo institucional',
    format: 'Vídeo de 2 minutos',
    description: 'Histórias do campo e do projeto de impacto para exibir durante o culto.',
    icon: <MovieIcon aria-hidden />,
    href: undefined as string | undefined,
  },
  {
    id: 'bulletin',
    title: 'Folheto para o boletim',
    format: 'Para imprimir ou enviar',
    description: 'Resumo da campanha, motivos de oração e o QR Code para ofertar.',
    icon: <NewspaperIcon aria-hidden />,
    href: undefined as string | undefined,
  },
];

type Step = { title: string; description: string; icon: ReactNode };

const STEPS: Step[] = [
  {
    title: 'Baixe o Kit de Mídia do Culto de Missões',
    description:
      'Slides em 16:9, vídeo institucional de 2 minutos para o telão e folheto para o boletim.',
    icon: <CoPresentIcon aria-hidden />,
  },
  {
    title: 'Adote o Dia Oficial da campanha',
    description:
      'O Mission App define o Dia Oficial de cada campanha. A igreja reserva essa data no calendário e realiza o culto de missões nesse dia, junto com as outras igrejas.',
    icon: <EventIcon aria-hidden />,
  },
  {
    title: 'Exiba o QR Code da campanha',
    description:
      'Os membros apontam a câmera do celular para a página da campanha, leem sobre o projeto de impacto e ofertam com transparência.',
    icon: <QrCode2Icon aria-hidden />,
  },
];

type CampaignAdoptionGuideProps = {
  campaign: CampaignData;
  /**
   * `summary` (landing page): the problem and the three steps, with links to
   * the full guide. `full` (church guide): also the media kit and the real QR code.
   */
  variant: 'summary' | 'full';
  headingId: string;
};

const cardSx = {
  p: { xs: 2.5, sm: 3 },
  borderRadius: 3,
  bgcolor: 'background.paper',
  border: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark'
      ? '1px solid var(--mui-palette-action2-borderSubtle)'
      : '1px solid var(--mui-palette-divider)',
  boxShadow: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(13, 43, 92, 0.05)',
  height: '100%',
} as const;

function StepNumber({ value }: { value: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // NOTE: the deep orange keeps white text above 4.5:1
        bgcolor: 'mission.main',
        color: 'mission.contrastText',
        fontWeight: 800,
      }}
    >
      {value}
    </Box>
  );
}

function MediaKit() {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {MEDIA_KIT_ITEMS.map((item) => (
        <Grid key={item.id} size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box sx={{ color: 'accent.main', display: 'flex' }}>{item.icon}</Box>
              <Typography component="h4" sx={{ fontWeight: 700, minWidth: 0 }}>
                {item.title}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {item.format}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              {item.description}
            </Typography>
            {item.href ? (
              <PillButton href={item.href} tone="primaryOutline" sx={{ minHeight: 44 }}>
                Baixar
              </PillButton>
            ) : (
              <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
                <Chip label="Em breve" size="small" variant="outlined" />
                <PillButton
                  disabled
                  tone="primaryOutline"
                  sx={{ minHeight: 44, width: '100%' }}
                  aria-label={`${item.title}: download em breve`}
                >
                  Download em breve
                </PillButton>
              </Stack>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * "Como a Igreja Adota as Campanhas Recorrentes do Mission App": how the
 * leadership adopts the campaign in effect in three steps (media kit, official
 * day, QR code).
 */
export default function CampaignAdoptionGuide({
  campaign,
  variant,
  headingId,
}: CampaignAdoptionGuideProps) {
  const full = variant === 'full';

  return (
    <Box component="section" aria-labelledby={headingId} sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.08em', color: 'accent.main' }}
        >
          Campanhas missionárias recorrentes
        </Typography>
        <Typography
          id={headingId}
          component="h2"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
            fontWeight: 800,
            lineHeight: 1.25,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          Como a igreja adota as campanhas recorrentes do Mission App
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          ...cardSx,
          height: 'auto',
          mb: 3,
          borderLeft: '5px solid',
          borderLeftColor: 'accent.main',
        }}
      >
        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>O problema comum</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
          A igreja local quer fazer missões, mas o conselho missionário não tem tempo de produzir
          artes, vídeos de campo e estatísticas. Cada campanha do Mission App chega com esse
          material pronto: a liderança só precisa adotá-la.
        </Typography>
      </Card>

      <Stack component="ol" spacing={2.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {STEPS.map((step, index) => (
          <Card key={step.title} component="li" elevation={0} sx={{ ...cardSx, height: 'auto' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <StepNumber value={index + 1} />
              <Box sx={{ color: 'accent.main', display: 'flex' }}>{step.icon}</Box>
              <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.05rem', minWidth: 0 }}>
                {step.title}
              </Typography>
            </Stack>
            {/* NOTE: below the number, full width: narrow phones keep room for the kit and the QR code */}
            <Box sx={{ mt: 1.25, pl: { sm: 7 }, minWidth: 0 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {step.description}
              </Typography>
              {index === 1 ? (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Dia Oficial da campanha vigente: {campaign.churchDay}
                </Typography>
              ) : null}
              {full && index === 0 ? <MediaKit /> : null}
              {full && index === 2 ? (
                <Box sx={{ mt: 2 }}>
                  <CampaignQrCode campaign={campaign} />
                </Box>
              ) : null}
            </Box>
          </Card>
        ))}
      </Stack>

      {full ? null : (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ mt: 3.5, '& > *': { width: { xs: '100%', sm: 'auto' } } }}
        >
          <BringMissionAppButton />
          <PillButton
            href={campaignPath(campaign)}
            tone="primaryOutline"
            sx={{ minHeight: 44, px: 3, fontWeight: 600, justifyContent: 'center' }}
          >
            Conhecer a campanha vigente
          </PillButton>
        </Stack>
      )}
    </Box>
  );
}
