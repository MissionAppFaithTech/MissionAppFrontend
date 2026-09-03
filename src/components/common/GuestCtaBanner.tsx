'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PillButton from '@/components/common/PillButton';

type GuestCtaBannerProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function GuestCtaBanner({
  title = 'Crie sua conta para acompanhar',
  description = 'Com uma conta você segue missionários, recebe atualizações do campo e apoia campanhas diretamente pelo app.',
  buttonText = 'Criar conta',
  buttonHref = '/select-role',
}: GuestCtaBannerProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 8px rgba(13, 43, 92, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: 'mission.main',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: 'rgba(249, 115, 22, 0.12)',
                color: 'mission.main',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <PersonAddAlt1OutlinedIcon sx={{ fontSize: 24 }} />
            </Box>

            <Stack spacing={0.5}>
              <Typography
                variant="subtitle1"
                component="h2"
                color="text.primary"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  lineHeight: 1.5,
                  maxWidth: 640,
                }}
              >
                {description}
              </Typography>
            </Stack>
          </Stack>

          <PillButton
            href={buttonHref}
            tone="missionFilled"
            size="medium"
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 700,
              alignSelf: { xs: 'stretch', sm: 'center' },
              whiteSpace: 'nowrap',
              minHeight: 40,
            }}
          >
            {buttonText}
          </PillButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
