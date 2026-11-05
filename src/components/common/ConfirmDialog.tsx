'use client';

import { useId, type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import PillButton, { type PillButtonTone } from '@/components/common/PillButton';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  /** Label of the button that dismisses the dialog (focused on open). */
  cancelLabel: string;
  confirmLabel: string;
  /** `danger` for destructive actions. */
  confirmTone?: PillButtonTone;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Accessible confirmation dialog (labelled and described, focus trapped,
 * Escape closes). The safe choice gets the initial focus; on mobile the
 * actions stack with the confirmation on top.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmTone = 'primaryFilled',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onCancel()}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 480, mx: 2 } } }}
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId} sx={{ color: 'text.primary' }}>
          {description}
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
            onClick={onCancel}
            disabled={loading}
            autoFocus
            sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
          >
            {cancelLabel}
          </PillButton>
          <PillButton
            tone={confirmTone}
            size="medium"
            onClick={onConfirm}
            loading={loading}
            sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
          >
            {confirmLabel}
          </PillButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
