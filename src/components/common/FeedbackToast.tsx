'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFeedbackStore } from '@/stores/feedbackStore';

/** Long enough to read and be announced; Snackbar pauses while hovered or the window is blurred. */
export const FEEDBACK_TOAST_DURATION_MS = 6000;

/**
 * Global toast for action feedback (NF 3.1). Lives in the root providers so a
 * message shown right before navigating is still read by screen readers.
 */
export default function FeedbackToast() {
  const current = useFeedbackStore((s) => s.current);
  const dismiss = useFeedbackStore((s) => s.dismiss);

  return (
    <Snackbar
      key={current?.id}
      open={Boolean(current)}
      autoHideDuration={FEEDBACK_TOAST_DURATION_MS}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') dismiss();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={dismiss}
        severity={current?.severity ?? 'success'}
        variant="filled"
        role={current?.severity === 'error' ? 'alert' : 'status'}
        aria-live={current?.severity === 'error' ? 'assertive' : 'polite'}
        slotProps={{ closeButton: { 'aria-label': 'Fechar aviso' } }}
        sx={{ fontWeight: 600, width: '100%', maxWidth: { xs: '100%', sm: 480 } }}
      >
        {current?.message}
      </Alert>
    </Snackbar>
  );
}
