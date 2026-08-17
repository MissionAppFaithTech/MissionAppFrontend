import Image from 'next/image';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { mockProfile } from '@/mocks/profile';

const impactProject = {
  title: 'Missões na África do Sul',
  description:
    'Atuo na África do Sul juntamente com a base missionária da JOCUM. Realizamos evangelismo de impacto em escolas, hospitais e nos locais onde os mais marginalizados da sociedade se encontram.',
} as const;

const cardSx = {
  borderRadius: { xs: 2, sm: 3 },
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
} as const;

function SectionTitle({ children, editHref }: { children: string; editHref: string }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h6" color="primary.main">
        {children}
      </Typography>
      <IconButton
        href={editHref}
        size="small"
        aria-label={`Editar ${children.toLowerCase()}`}
        sx={{ color: 'primary.main' }}
      >
        <EditOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Stack>
  );
}

export default function ProfileHomePage() {
  return (
    <Stack spacing={2}>
      <Card component="section" elevation={0} sx={cardSx}>
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Stack spacing={1.5}>
            <SectionTitle editHref="/profile/sobre">Sobre</SectionTitle>
            <Typography variant="body2">{mockProfile.about.introduction}</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card component="section" elevation={0} sx={cardSx}>
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Stack spacing={{ xs: 2, sm: 2.5 }}>
            <Box>
              <SectionTitle editHref="/profile/projeto-de-impacto">
                Projeto de impacto e atuação missionária
              </SectionTitle>
              <Typography variant="h5" sx={{ mt: 0.5, color: 'text.primary' }}>
                {impactProject.title}
              </Typography>
            </Box>

            <Typography variant="body2">{impactProject.description}</Typography>

            <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: { xs: '16 / 9', sm: '21 / 9' },
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'surface.main',
                }}
              >
                <Image
                  src="/landing-page/landing-page.png"
                  alt="Atuação missionária ao redor do mundo"
                  fill
                  sizes="(max-width: 600px) 100vw, 1100px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: { xs: '16 / 9', sm: '21 / 9' },
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'surface.main',
                }}
              >
                <Image
                  src="/landing-page/background.png"
                  alt="Mapa da atuação missionária"
                  fill
                  sizes="(max-width: 600px) 100vw, 1100px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ justifyContent: 'center', pt: { xs: 0.5, sm: 1 } }}
            >
              <PillButton
                tone="primarySoftOutline"
                size="small"
                sx={{ width: { xs: '100%', sm: 160 } }}
              >
                Apoiar missão
              </PillButton>
              <PillButton
                tone="primarySoftOutline"
                size="small"
                sx={{ width: { xs: '100%', sm: 160 } }}
              >
                Compartilhar
              </PillButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
