'use client';

import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { ProfileData } from '@/types/profile';

type ProfileSummaryCardProps = {
  profile: Pick<ProfileData, 'username' | 'displayName' | 'roleDescription' | 'followersCount'>;
};

export default function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const actionSx = {
    px: { xs: 1.25, sm: 1.75 },
    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
    whiteSpace: 'nowrap' as const,
  };

  /** Mobile: Contato + Compartilhar + Editar na mesma linha. sm+: só Contato/Compartilhar. */
  const contactActions = (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
      }}
    >
      <PillButton
        tone="primaryFilled"
        size="small"
        sx={{ ...actionSx, display: { xs: 'inline-flex', sm: 'none' } }}
      >
        Editar perfil
      </PillButton>
      <PillButton tone="primarySoftOutline" size="small" sx={actionSx}>
        Contato
      </PillButton>
      <PillButton tone="primarySoftOutline" size="small" sx={actionSx}>
        Compartilhar perfil
      </PillButton>
    </Stack>
  );

  /** sm+: Editar + Seguidores à direita. Mobile: só Seguidores. */
  const primaryActions = (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        flexShrink: 0,
        alignItems: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <PillButton
        tone="primaryFilled"
        size="small"
        sx={{ ...actionSx, display: { xs: 'none', sm: 'inline-flex' } }}
      >
        Editar perfil
      </PillButton>
      <PillButton
        tone="missionFilled"
        size="small"
        sx={{
          ...actionSx,
          minWidth: { sm: 110 },
        }}
      >
        {profile.followersCount} Seguidores
      </PillButton>
    </Stack>
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 1.75, md: 0 }}>
          <Stack
            direction="row"
            spacing={{ xs: 1.5, md: 4 }}
            sx={{
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 1.25, sm: 2, md: 3 }}
              sx={{
                minWidth: 0,
                flex: 1,
                alignItems: { xs: 'flex-start', md: 'center' },
              }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: { xs: 64, sm: 88, md: 112 },
                    height: { xs: 64, sm: 88, md: 112 },
                    bgcolor: 'supporter.light',
                    color: 'common.black',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 36, sm: 48, md: 60 } }} />
                </Avatar>
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: { xs: 0, md: 5 },
                    width: { xs: 22, md: 30 },
                    height: { xs: 22, md: 30 },
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  <AddIcon sx={{ fontSize: { xs: 14, md: 20 } }} />
                </Box>
              </Box>

              <Stack
                spacing={{ xs: 0.5, md: 1.25 }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  @{profile.username}
                </Typography>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{
                    fontSize: { xs: '1.125rem', sm: '1.5rem', md: '1.75rem' },
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  {profile.displayName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  {profile.roleDescription}
                </Typography>

                <Box sx={{ display: { xs: 'none', md: 'block' }, pt: 0.25 }}>
                  {contactActions}
                </Box>
              </Stack>
            </Stack>

            {primaryActions}
          </Stack>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>{contactActions}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
