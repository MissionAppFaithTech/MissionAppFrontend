'use client';

import type { FormEventHandler, ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import PillButton from '@/components/common/PillButton';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

type CatalogCreateDialogProps = {
  open: boolean;
  title: string;
  description: string;
  titleId: string;
  descriptionId: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting?: boolean;
  children: ReactNode;
};

export default function CatalogCreateDialog({
  open,
  title,
  description,
  titleId,
  descriptionId,
  onClose,
  onSubmit,
  isSubmitting = false,
  children,
}: CatalogCreateDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      scroll="paper"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : { xs: 2, sm: 3 },
            m: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
            boxShadow: 'var(--app-shadow-overlay)',
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1,
        }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            id={titleId}
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
        <IconButton
          aria-label={`Fechar ${title}`}
          onClick={onClose}
          sx={{ width: 44, height: 44, flexShrink: 0, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 1,
        }}
      >
        <Stack component="form" id={`${titleId}-form`} spacing={2} onSubmit={onSubmit} noValidate>
          {children}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
          pt: 1.5,
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& .MuiButton-root': {
            ...FORM_ACTION_BUTTON_SX,
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <PillButton type="button" tone="primarySoftOutline" onClick={onClose}>
          Cancelar
        </PillButton>
        <PillButton
          type="submit"
          form={`${titleId}-form`}
          tone="primaryFilled"
          loading={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </PillButton>
      </DialogActions>
    </Dialog>
  );
}
