'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProfileData } from '@/types/profile';

type ProfileAccountMenuProps = {
  profile: Pick<ProfileData, 'username' | 'displayName'>;
  role?: 'missionary' | 'supporter' | 'visitor';
};

export default function ProfileAccountMenu({ profile, role = 'missionary' }: ProfileAccountMenuProps) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  return (
    <>
      <IconButton
        aria-label="Abrir menu do perfil"
        aria-controls={isOpen ? 'profile-account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
        onClick={handleOpen}
        sx={{ p: 0.5, minWidth: 44, minHeight: 44 }}
      >
        <Avatar
          sx={{
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            bgcolor: 'avatar.main',
            color: 'avatar.contrastText',
          }}
        >
          <PersonIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Avatar>
      </IconButton>

      <Popover
        id="profile-account-menu"
        open={isOpen}
        anchorEl={anchorElement}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 288 },
              maxWidth: 320,
              mt: 1.25,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'var(--app-shadow-overlay)',
            },
          },
        }}
      >
        <Stack sx={{ p: 2.5, alignItems: 'center', textAlign: 'center' }}>
          <Box sx={{ position: 'relative', mb: 1.25 }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: 'avatar.main',
                color: 'avatar.contrastText',
                border: '1px solid',
                borderColor: 'primary.main',
              }}
            >
              <PersonIcon sx={{ fontSize: 42 }} />
            </Avatar>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: -2,
                bottom: 2,
                width: 24,
                height: 24,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'common.white',
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            @{profile.username}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {profile.displayName}
          </Typography>
        </Stack>

        <Divider />

        <Box
          component={Link}
          href="/profile/projetos-de-impacto"
          onClick={handleClose}
          sx={{
            display: 'block',
            px: 2.5,
            py: 1.5,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Perfil Missionário</Typography>
        </Box>

        <Box
          component={Link}
          href="/profile/supporter/missionarios"
          onClick={handleClose}
          sx={{
            display: 'block',
            px: 2.5,
            py: 1.5,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Perfil Apoiador</Typography>
        </Box>

        <Divider />

        <Box
          component={Link}
          href="/profile/financeiro"
          onClick={handleClose}
          sx={{
            display: 'block',
            px: 2.5,
            py: 1.5,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
            Configurações Financeiras
          </Typography>
        </Box>

        <Divider />
        <Box
          component={Link}
          href={role === 'supporter' ? '/profile/supporter/edit-profile' : '/profile/edit-profile'}
          onClick={handleClose}
          sx={{
            display: 'block',
            px: 2.5,
            py: 1.5,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Dados cadastrais</Typography>
        </Box>

        <Divider />

        <Box
          component={Link}
          href={role === 'supporter' ? '/profile/supporter/configuracoes' : '/profile/configuracoes'}
          onClick={handleClose}
          sx={{
            display: 'block',
            px: 2.5,
            py: 2,
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Configurações de conta</Typography>
        </Box>
      </Popover>
    </>
  );
}
