'use client';

import type { FormEventHandler, ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';

const actionButtonSx = {
  minHeight: { xs: 44, sm: 40 },
  fontSize: '0.875rem',
  fontWeight: 600,
  gap: 1,
} as const;

type RegisterStepFormProps = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  sectionTitle?: ReactNode;
  onBack?: () => void;
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
};

/**
 * Shared chrome for register wizard steps: section title, fields, back/continue.
 */
export default function RegisterStepForm({
  children,
  onSubmit,
  sectionTitle,
  onBack,
  submitLabel = 'Continuar',
  submittingLabel = 'Continuando...',
  isSubmitting = false,
}: RegisterStepFormProps) {
  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={onSubmit}
      sx={{ width: '100%' }}
      noValidate
    >
      {sectionTitle ? (
        <Typography component="h2" variant="body1">
          {sectionTitle}
        </Typography>
      ) : null}
      {children}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        {onBack ? (
          <PillButton
            type="button"
            tone="primarySoftOutline"
            onClick={onBack}
            fullWidth
            sx={actionButtonSx}
          >
            Voltar
          </PillButton>
        ) : null}
        <PillButton
          type="submit"
          tone="cta"
          loading={isSubmitting}
          fullWidth
          sx={actionButtonSx}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </PillButton>
      </Stack>
    </Stack>
  );
}
