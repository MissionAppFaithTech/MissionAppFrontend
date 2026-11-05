'use client';

import { useState } from 'react';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type Props = {
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Trash overlay on the profile avatar (opposite corner of the "+" button). Asks
 * before removing, since the photo is deleted from the storage.
 */
export default function ProfilePhotoRemoveButton({ onConfirm, disabled, loading }: Props) {
  const [open, setOpen] = useState(false);

  const confirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label="Remover foto de perfil"
        onClick={() => setOpen(true)}
        disabled={disabled}
        sx={{
          position: 'absolute',
          left: -12,
          bottom: -8,
          width: 44,
          height: 44,
          p: 0,
          color: 'error.main',
        }}
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
          <DeleteOutlinedIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
        </Box>
      </IconButton>

      <ConfirmDialog
        open={open}
        title="Remover foto de perfil?"
        description="Seu perfil volta a mostrar o ícone padrão. Você pode enviar outra foto quando quiser."
        cancelLabel="Cancelar"
        confirmLabel="Remover foto"
        confirmTone="danger"
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={confirm}
      />
    </>
  );
}
