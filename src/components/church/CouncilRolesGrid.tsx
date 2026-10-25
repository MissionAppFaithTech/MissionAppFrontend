'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { COUNCIL_ROLES, type CouncilRole } from './churchGuideData';

const roleIcons: Record<CouncilRole['iconName'], React.ReactNode> = {
  coordinator: <GroupsIcon sx={{ fontSize: 32 }} />,
  secretary: <AssignmentIcon sx={{ fontSize: 32 }} />,
  financial: <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />,
  intercession: <VolunteerActivismIcon sx={{ fontSize: 32 }} />,
  care: <FavoriteIcon sx={{ fontSize: 32 }} />,
};

export default function CouncilRolesGrid() {
  return (
    <Box component="section" aria-labelledby="roles-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          id="roles-heading"
          component="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          Estrutura e Atribuições do Conselho (5 Funções Essenciais)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 800 }}>
          Cada função atua de forma complementar para conectar todos os ministérios da igreja local
          à obra missionária de maneira sustentável e pastoral.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {COUNCIL_ROLES.map((role: CouncilRole, index: number) => {
          return (
            <Grid
              key={role.id}
              size={{ xs: 12, sm: 6, lg: index === 0 ? 12 : 6 }}
              sx={{ display: 'flex' }}
            >
              <Card
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  width: '100%',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px solid var(--mui-palette-action2-borderSubtle)'
                      : '1px solid var(--mui-palette-divider)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(13, 43, 92, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--app-shadow-overlay)'
                        : '0 8px 24px rgba(13, 43, 92, 0.1)',
                  },
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(13, 43, 92, 0.06)',
                        color: 'primary.main',
                      }}
                    >
                      {roleIcons[role.iconName]}
                    </Box>

                    <Chip
                      label={role.roleBadge}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(194, 65, 12, 0.08)',
                        color: 'accent.main',
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(194, 65, 12, 0.2)',
                      }}
                    />
                  </Box>

                  <Typography
                    component="h4"
                    sx={{
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      fontWeight: 700,
                      color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                      mb: 1.25,
                    }}
                  >
                    {role.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '0.925rem' } }}
                  >
                    {role.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
