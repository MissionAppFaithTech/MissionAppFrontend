'use client';

import Box from '@mui/material/Box';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import {
  CharacterLimitMessage,
  characterLimitStatus,
  limitReachedOutlineSx,
} from '@/components/common/CharacterLimit';

type LimitedTextFieldProps = Omit<TextFieldProps, 'value'> & {
  id: string;
  value: string;
  maxLength: number;
  /** Extra attributes for the native input (e.g. `aria-invalid`). */
  htmlInputProps?: Record<string, unknown>;
};

/**
 * Single-line TextField that turns red and explains itself when the text hits
 * `maxLength` (the browser silently stops typing and truncates pastes there).
 */
export default function LimitedTextField({
  id,
  value,
  maxLength,
  htmlInputProps,
  error,
  sx,
  ...props
}: LimitedTextFieldProps) {
  const limitId = `${id}-limit`;
  // A validation error keeps its own red styling; the limit outline only shows without one.
  const highlightLimit = characterLimitStatus(value.length, maxLength) === 'reached' && !error;
  const describedBy = [
    htmlInputProps?.['aria-describedby'],
    props.helperText ? `${id}-helper-text` : null,
    limitId,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box sx={{ minWidth: 0 }} data-limit-reached={highlightLimit || undefined}>
      <TextField
        {...props}
        id={id}
        value={value}
        error={error}
        sx={[
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          highlightLimit ? limitReachedOutlineSx : null,
        ]}
        slotProps={{
          ...props.slotProps,
          htmlInput: { ...htmlInputProps, maxLength, 'aria-describedby': describedBy },
        }}
      />
      <CharacterLimitMessage id={limitId} length={value.length} maxLength={maxLength} />
    </Box>
  );
}
