'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PillButton from '@/components/common/PillButton';
import StyledTextArea from '@/components/common/StyledTextArea';

export default function RejectRegistrationDialog({
  open,
  name,
  onClose,
  onConfirm,
  onExited,
}: {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  onExited: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="reject-registration-title"
      aria-describedby="reject-registration-description"
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, m: 2, width: 'calc(100% - 32px)' } },
        transition: {
          onExited: () => {
            setReason('');
            setError(false);
            onExited();
          },
        },
      }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!reason.trim()) {
            setError(true);
            inputRef.current?.focus();
            return;
          }
          onConfirm(reason.trim());
        }}
      >
        <Stack
          direction="row"
          useFlexGap
          sx={{ px: 3, pt: 2, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box
            sx={{
              bgcolor: 'action.hover',
              color: 'error.main',
              display: 'flex',
              p: 1.25,
              borderRadius: 2,
            }}
          >
            <PersonRemoveOutlinedIcon aria-hidden />
          </Box>
          <IconButton
            aria-label="Fechar reprovação de cadastro"
            onClick={onClose}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <DialogTitle id="reject-registration-title" sx={{ fontWeight: 700, pb: 1 }}>
          Reprovar cadastro
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {name}
          </Typography>
          <Typography
            id="reject-registration-description"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2.5 }}
          >
            Descreva o que precisa ser corrigido. O motivo ficará registrado nesta análise de
            exemplo.
          </Typography>
          <StyledTextArea
            id="rejection-reason"
            label="Motivo da reprovação"
            value={reason}
            onChange={(value) => {
              setReason(value);
              if (value.trim()) setError(false);
            }}
            required
            minRows={4}
            maxLength={2000}
            inputRef={inputRef}
            error={error}
            helperText={
              error
                ? 'Informe o motivo da reprovação.'
                : 'Campo obrigatório. Descreva o que precisa ser corrigido.'
            }
          />
          {error && (
            <Typography role="alert" variant="caption" color="error.main">
              O cadastro não foi reprovado. Preencha o motivo.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            useFlexGap
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <PillButton
              tone="primarySoftOutline"
              autoFocus
              onClick={onClose}
              sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
            >
              Cancelar
            </PillButton>
            <PillButton
              tone="danger"
              color="error"
              type="submit"
              sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
            >
              Reprovar cadastro
            </PillButton>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
