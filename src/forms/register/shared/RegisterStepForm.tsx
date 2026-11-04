'use client';

import { useEffect, useRef, type ReactNode, type SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { REGISTER_FIELD_LABELS } from '@/forms/register/shared/fieldErrors';
import { visuallyHiddenSx } from '@/lib/a11y';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

const actionButtonSx = {
  ...FORM_ACTION_BUTTON_SX,
  fontWeight: 600,
  gap: 1,
} as const;

/** Id of the step heading: the wizard moves focus to it when the step changes. */
export const REGISTER_STEP_HEADING_ID = 'register-step-heading';

type FieldErrorMap = Partial<Record<string, { message?: unknown } | undefined>>;

type RegisterStepFormProps = {
  children: ReactNode;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  sectionTitle?: ReactNode;
  /** Announced before the title to screen readers: "Etapa 2 de 3". */
  progress?: { step: number; total: number };
  onBack?: () => void;
  submitLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  /** Current field errors of the step (react-hook-form `formState.errors`). */
  errors?: FieldErrorMap;
  /** Grows on every submit attempt: an attempt with errors focuses the summary. */
  submitCount?: number;
  /** Shows and focuses the summary without a submit (errors sent back by the API). */
  showSummary?: boolean;
  /** Grows when the API rejects fields after a submit: focuses the summary again. */
  serverErrorCount?: number;
};

function summaryItems(errors: FieldErrorMap = {}) {
  return Object.entries(errors).flatMap(([field, error]) =>
    typeof error?.message === 'string' && error.message
      ? [{ field, label: REGISTER_FIELD_LABELS[field] ?? field, message: error.message }]
      : []
  );
}

/**
 * Shared chrome for register wizard steps: heading, required-fields note, error
 * summary (GOV.UK pattern), fields and back/continue.
 */
export default function RegisterStepForm({
  children,
  onSubmit,
  sectionTitle,
  progress,
  onBack,
  submitLabel = 'Continuar',
  submittingLabel = 'Continuando...',
  isSubmitting = false,
  errors,
  submitCount = 0,
  showSummary = false,
  serverErrorCount = 0,
}: RegisterStepFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const items = summaryItems(errors);
  const summaryVisible =
    items.length > 0 && (submitCount > 0 || showSummary || serverErrorCount > 0);
  const hasErrors = items.length > 0;

  useEffect(() => {
    if ((submitCount > 0 || showSummary || serverErrorCount > 0) && hasErrors) {
      summaryRef.current?.focus();
    }
    // Only a new submit attempt (or errors sent back by the API) moves focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount, showSummary, serverErrorCount]);

  const focusField = (field: string) => {
    const form = formRef.current;
    // Selects expose their combobox by id; text fields and radios by name.
    const target =
      document.getElementById(field) ?? form?.querySelector<HTMLElement>(`[name="${field}"]`);
    target?.focus();
    target?.scrollIntoView?.({ block: 'center' });
  };

  return (
    <Stack
      ref={formRef}
      component="form"
      spacing={2}
      onSubmit={onSubmit}
      sx={{ width: '100%' }}
      noValidate
    >
      {sectionTitle ? (
        <Box>
          <Typography
            id={REGISTER_STEP_HEADING_ID}
            component="h2"
            variant="body1"
            tabIndex={-1}
            sx={{ fontWeight: 600, scrollMarginTop: 80 }}
          >
            {progress ? (
              <Box component="span" sx={visuallyHiddenSx}>
                {`Etapa ${progress.step} de ${progress.total}: `}
              </Box>
            ) : null}
            {sectionTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Campos marcados com{' '}
            <Box component="span" aria-hidden>
              *
            </Box>
            <Box component="span" sx={visuallyHiddenSx}>
              asterisco
            </Box>{' '}
            são obrigatórios.
          </Typography>
        </Box>
      ) : null}

      {summaryVisible ? (
        <Alert
          ref={summaryRef}
          severity="error"
          role="alert"
          tabIndex={-1}
          sx={{ '&:focus-visible': { outline: '3px solid', outlineOffset: 2 } }}
        >
          <AlertTitle component="p" sx={{ fontWeight: 700 }}>
            {items.length === 1
              ? 'Corrija 1 campo para continuar'
              : `Corrija ${items.length} campos para continuar`}
          </AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {items.map((item) => (
              <li key={item.field}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => focusField(item.field)}
                  sx={{
                    textAlign: 'left',
                    minHeight: 44,
                    color: 'inherit',
                    fontWeight: 600,
                    textDecorationColor: 'currentColor',
                  }}
                >
                  {item.label}: {item.message}
                </Link>
              </li>
            ))}
          </Box>
        </Alert>
      ) : null}

      {children}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap>
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
        <PillButton type="submit" tone="cta" loading={isSubmitting} fullWidth sx={actionButtonSx}>
          {isSubmitting ? submittingLabel : submitLabel}
        </PillButton>
      </Stack>
    </Stack>
  );
}
