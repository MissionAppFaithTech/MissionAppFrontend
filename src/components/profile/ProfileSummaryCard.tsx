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
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2.5, sm: 3, md: 4 }}
          sx={{ alignItems: 'center' }}
        >
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              sx={{
                width: { xs: 88, sm: 96, md: 112 },
                height: { xs: 88, sm: 96, md: 112 },
                bgcolor: 'supporter.light',
                color: 'common.black',
                border: '1px solid',
                borderColor: 'primary.main',
                boxShadow: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: { xs: 48, sm: 52, md: 60 } }} />
            </Avatar>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: 1,
                bottom: { xs: 2, md: 5 },
                width: { xs: 26, md: 30 },
                height: { xs: 26, md: 30 },
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'common.white',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              <AddIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
            </Box>
          </Box>

          <Stack
            spacing={1.25}
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              @{profile.username}
            </Typography>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}
            >
              {profile.displayName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {profile.roleDescription}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <PillButton
                tone="primarySoftOutline"
                size="small"
                sx={{ flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                Contato
              </PillButton>
              <PillButton
                tone="primarySoftOutline"
                size="small"
                sx={{ flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                Compartilhar perfil
              </PillButton>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              alignSelf: { xs: 'stretch', sm: 'center', md: 'flex-start' },
              flexShrink: 0,
            }}
          >
            <PillButton
              tone="primaryFilled"
              size="small"
              sx={{ flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
            >
              Editar perfil
            </PillButton>
            <PillButton
              tone="missionFilled"
              size="small"
              sx={{
                flex: { xs: 1, sm: 'initial' },
                minWidth: { sm: 110 },
                whiteSpace: 'nowrap',
              }}
            >
              {profile.followersCount} Seguidores
            </PillButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
