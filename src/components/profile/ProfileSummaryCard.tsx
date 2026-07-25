'use client';

import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProfileData } from '@/types/profile';

type ProfileSummaryCardProps = {
  profile: Pick<ProfileData, 'username' | 'displayName' | 'roleDescription' | 'followersCount'>;
};

export default function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
      }}
    >
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              sx={{
                width: 112,
                height: 112,
                bgcolor: 'supporter.light',
                color: 'common.black',
                border: '1px solid',
                borderColor: 'primary.main',
                boxShadow: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: 1,
                bottom: 5,
                width: 30,
                height: 30,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'common.white',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              <AddIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              @{profile.username}
            </Typography>
            <Typography variant="h4" color="primary.main">
              {profile.displayName}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {profile.roleDescription}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" color="primary">
                Contato
              </Button>
              <Button variant="outlined" color="primary">
                Compartilhar perfil
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignSelf: 'flex-start' }}>
            <Button variant="contained" color="primary" sx={{ px: 2.5 }}>
              Editar perfil
            </Button>
            <Button variant="contained" color="mission" sx={{ px: 2.5, minWidth: 126 }}>
              {profile.followersCount} Seguidores
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
