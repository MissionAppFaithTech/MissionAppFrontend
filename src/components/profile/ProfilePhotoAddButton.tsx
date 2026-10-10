'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

/**
 * Plus overlay on the profile avatar — same look on the header and edit forms.
 */
export default function ProfilePhotoAddButton({
  children,
  sx,
  ...props
}: IconButtonProps) {
  return (
    <IconButton
      aria-label="Adicionar foto de perfil"
      {...props}
      sx={[
        {
          position: 'absolute',
          right: -12,
          bottom: -8,
          width: 44,
          height: 44,
          p: 0,
          color: 'primary.main',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        aria-hidden
        sx={{
          width: { xs: 24, sm: 28 },
          height: { xs: 24, sm: 28 },
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: 'background.paper',
          border: '1.5px solid',
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
      </Box>
      {children}
    </IconButton>
  );
}
