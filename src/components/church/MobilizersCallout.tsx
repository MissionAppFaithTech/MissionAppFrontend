import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PillButton from '@/components/common/PillButton';
import { CHURCH_COUNCIL_PATH } from '@/lib/church/paths';

const ROLES: { text: string; icon: ReactNode }[] = [
  {
    text: 'Orar pelos missionários e projetos de cada campanha',
    icon: <VolunteerActivismIcon aria-hidden />,
  },
  {
    text: 'Divulgar as campanhas no culto e nos grupos da igreja',
    icon: <CampaignIcon aria-hidden />,
  },
  {
    text: 'Manter a congregação conectada ao campo o ano inteiro',
    icon: <PublicIcon aria-hidden />,
  },
];

/**
 * After the campaign: invites the reader to gather mobilizers and volunteers
 * in the local church — the seed of a missionary council — and links to the
 * council guide.
 */
export default function MobilizersCallout() {
  return (
    <Card
      component="section"
      aria-labelledby="mobilizers-heading"
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 4,
        // NOTE: deep navy in both themes; white text stays above 12:1
        bgcolor: 'var(--app-footer-bg)',
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 'auto -10% -40% auto',
          width: { xs: 220, md: 340 },
          height: { xs: 220, md: 340 },
          borderRadius: '50%',
          bgcolor: 'rgba(194, 65, 12, 0.22)',
          pointerEvents: 'none',
        },
      }}
    >
      <Stack spacing={3} sx={{ position: 'relative', maxWidth: 860 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'mission.main',
              color: 'mission.contrastText',
              flexShrink: 0,
            }}
          >
            <GroupsIcon aria-hidden />
          </Box>
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'common.white' }}
          >
            Próximo passo
          </Typography>
        </Stack>

        <Typography
          id="mobilizers-heading"
          component="h2"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'common.white',
          }}
        >
          Forme um grupo de mobilizadores na sua igreja
        </Typography>
        <Typography
          sx={{ lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.1rem' }, color: 'common.white' }}
        >
          Reúna voluntários que amam missões para falar do campo na sua própria igreja local. Esse
          grupo é o começo de um conselho missionário: com ele, cada campanha chega mais longe.
        </Typography>

        <Grid container component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {ROLES.map((role) => (
            <Grid key={role.text} component="li" size={{ xs: 12, md: 4 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: 'flex-start',
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <Box sx={{ color: 'common.white', display: 'flex', flexShrink: 0 }}>
                  {role.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'common.white' }}>
                  {role.text}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box>
          <PillButton
            href={CHURCH_COUNCIL_PATH}
            tone="missionFilled"
            startIcon={<GroupsIcon aria-hidden />}
            sx={{
              minHeight: 48,
              px: 3.5,
              fontWeight: 700,
              fontSize: { xs: '0.9375rem', md: '1rem' },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: 'center',
            }}
          >
            Aprenda como fundar um conselho missionário
          </PillButton>
        </Box>
      </Stack>
    </Card>
  );
}
