'use client';

import { useId } from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BUTTON_BORDER_RADIUS } from '@/theme/theme';

export type StyledTextAreaProps = {
  id?: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
};

/**
 * Multiline field for profile edit forms. Posts keep using RichTextEditor.
 */
export default function StyledTextArea({
  id,
  label,
  value = '',
  onChange,
  placeholder,
  minRows = 3,
  maxRows = 12,
  maxLength,
  error = false,
  helperText,
  disabled = false,
  required = false,
}: StyledTextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? `styled-textarea-${generatedId}`;
  const helperId = `${fieldId}-helper`;
  const countId = `${fieldId}-count`;
  const describedBy =
    [helperText ? helperId : null, maxLength ? countId : null].filter(Boolean).join(' ') ||
    undefined;
  const visibleLabel = label.endsWith(':') ? label : `${label}:`;

  return (
    <Stack spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
      <Typography
        component="label"
        htmlFor={fieldId}
        variant="body2"
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        {visibleLabel}
        {required ? (
          <Typography component="span" sx={{ color: 'error.main' }} aria-hidden>
            {' '}
            *
          </Typography>
        ) : null}
      </Typography>
      <OutlinedInput
        id={fieldId}
        multiline
        fullWidth
        minRows={minRows}
        maxRows={maxRows}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        required={required}
        inputProps={{
          maxLength,
          'aria-invalid': error || undefined,
          'aria-describedby': describedBy,
          'aria-required': required || undefined,
        }}
        sx={{
          borderRadius: BUTTON_BORDER_RADIUS,
          bgcolor: 'action2.fieldBg',
          alignItems: 'flex-start',
          '& textarea': {
            resize: 'vertical',
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            lineHeight: 1.5,
            py: 0.5,
          },
        }}
      />
      {helperText || maxLength ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: helperText ? 'space-between' : 'flex-end',
            alignItems: 'flex-start',
          }}
        >
          {helperText ? (
            <FormHelperText id={helperId} error={error} sx={{ mx: 0, mt: 0 }}>
              {helperText}
            </FormHelperText>
          ) : null}
          {maxLength ? (
            <Typography
              id={countId}
              variant="caption"
              color={error ? 'error.main' : 'text.secondary'}
              sx={{ flexShrink: 0 }}
              aria-live="polite"
            >
              {value.length}/{maxLength} caracteres
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
