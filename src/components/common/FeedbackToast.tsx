'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useFeedbackStore, type FeedbackSeverity } from '@/stores/feedbackStore';

/** Long enough to read and be announced; Snackbar pauses while hovered or the window is blurred. */
export const FEEDBACK_TOAST_DURATION_MS = 6000;

/** Icon + title name the severity, so the color is never the only cue (WCAG 1.4.1). */
const SEVERITY: Record<FeedbackSeverity, { title: string; icon: ReactNode }> = {
  success: { title: 'Tudo certo', icon: <CheckCircleRoundedIcon /> },
  info: { title: 'Aviso', icon: <InfoRoundedIcon /> },
  error: { title: 'Algo deu errado', icon: <ErrorRoundedIcon /> },
};

const tint = (severity: FeedbackSeverity, percent: number) =>
  `color-mix(in srgb, var(--mui-palette-${severity}-main) ${percent}%, transparent)`;

/**
 * Global toast for action feedback (NF 3.1). Lives in the root providers so a
 * message shown right before navigating is still read by screen readers.
 */
export default function FeedbackToast() {
  const current = useFeedbackStore((s) => s.current);
  const dismiss = useFeedbackStore((s) => s.dismiss);
  const severity = current?.severity ?? 'success';
  const { title, icon } = SEVERITY[severity];
  const isError = severity === 'error';

  return (
    <Snackbar
      key={current?.id}
      open={Boolean(current)}
      autoHideDuration={FEEDBACK_TOAST_DURATION_MS}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') dismiss();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        left: { xs: 16, sm: '50%' },
        right: { xs: 16, sm: 'auto' },
        // Clears the mobile bottom navigation (shown below `md`).
        bottom: { xs: 'calc(84px + env(safe-area-inset-bottom))', md: 24 },
      }}
    >
      <Box
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        aria-atomic="true"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          width: { xs: '100%', sm: 'auto' },
          minWidth: { sm: 360 },
          maxWidth: { xs: '100%', sm: 480 },
          py: 1.5,
          pl: 1.5,
          pr: 0.5,
          borderRadius: '14px',
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: tint(severity, 70),
          borderLeft: '6px solid',
          borderLeftColor: `${severity}.main`,
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08)',
          backgroundImage: `linear-gradient(${tint(severity, 16)}, ${tint(severity, 16)})`,
        }}
      >
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            // Solid fill so the status reads at a glance; contrastText keeps the icon legible.
            color: `${severity}.contrastText`,
            bgcolor: `${severity}.main`,
            '& svg': { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
          <Typography
            component="p"
            sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.35 }}
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.45,
              color: 'text.secondary',
              overflowWrap: 'anywhere',
            }}
          >
            {current?.message}
          </Typography>
        </Box>
        <IconButton
          aria-label="Fechar aviso"
          onClick={dismiss}
          sx={{ flexShrink: 0, width: 44, height: 44, mt: -0.5, color: 'text.secondary' }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
