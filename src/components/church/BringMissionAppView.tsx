'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { campaignPath, featuredCampaign } from '@/lib/campaigns/featured';
import AboutMissionAppSection from './AboutMissionAppSection';
import CampaignAdoptionGuide from './CampaignAdoptionGuide';
import MobilizersCallout from './MobilizersCallout';

const sectionSx = { scrollMarginTop: { xs: '88px', md: '104px' } } as const;

/**
 * "Leve o Mission App para sua igreja": what the Mission App is, how the
 * church adopts the campaign in effect (kit, official day, QR code), then an
 * invitation to gather mobilizers and found a missionary council.
 */
export default function BringMissionAppView() {
  const scrollTo = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            mb: { xs: 4, md: 6 },
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'linear-gradient(135deg, rgba(13, 43, 92, 0.04) 0%, rgba(194, 65, 12, 0.06) 100%)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid var(--mui-palette-action2-borderSubtle)'
                : '1px solid var(--mui-palette-divider)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'accent.main',
            }}
          >
            Para sua igreja
          </Typography>
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
            Leve o Mission App para sua igreja
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
              maxWidth: 820,
              mb: 3.5,
            }}
          >
            Adote a campanha missionária recorrente com kit de mídia, Dia Oficial e QR Code prontos
            e mobilize a congregação para orar, conhecer e apoiar missionários e projetos sociais.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap', '& > *': { width: { xs: '100%', sm: 'auto' } } }}
          >
            <PillButton
              href="#campanha-recorrente"
              onClick={scrollTo('campanha-recorrente')}
              tone="missionFilled"
              sx={{ minHeight: 48, px: 3, fontWeight: 700, justifyContent: 'center' }}
            >
              Adotar a campanha vigente
            </PillButton>
            <PillButton
              href={campaignPath(featuredCampaign)}
              tone="primaryOutline"
              sx={{ minHeight: 48, px: 3, fontWeight: 600, justifyContent: 'center' }}
            >
              Conhecer a campanha vigente
            </PillButton>
          </Stack>
        </Card>

        <Stack spacing={{ xs: 6, md: 8 }}>
          <Box id="mission-app" sx={sectionSx}>
            <AboutMissionAppSection />
          </Box>

          <Divider />

          <Box id="campanha-recorrente" sx={sectionSx}>
            <CampaignAdoptionGuide
              campaign={featuredCampaign}
              variant="full"
              headingId="campaign-adoption-heading"
            />
          </Box>

          <MobilizersCallout />
        </Stack>
      </Container>
    </Box>
  );
}
