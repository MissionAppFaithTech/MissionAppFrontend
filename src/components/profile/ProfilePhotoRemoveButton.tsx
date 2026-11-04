'use client';

import { useId, useState } from 'react';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PillButton from '@/components/common/PillButton';

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
  const titleId = useId();
  const descriptionId = useId();

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

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 480, mx: 2 } } }}
      >
        <DialogTitle id={titleId} sx={{ fontWeight: 700 }}>
          Remover foto de perfil?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={descriptionId} sx={{ color: 'text.primary' }}>
            Seu perfil volta a mostrar o ícone padrão. Você pode enviar outra foto quando quiser.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <PillButton
              tone="primarySoftOutline"
              size="medium"
              onClick={() => setOpen(false)}
              disabled={loading}
              autoFocus
              sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
            >
              Cancelar
            </PillButton>
            <PillButton
              tone="danger"
              size="medium"
              onClick={confirm}
              loading={loading}
              sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
            >
              Remover foto
            </PillButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}
