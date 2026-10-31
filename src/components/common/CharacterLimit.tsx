'use client';

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type CharacterLimitStatus = 'ok' | 'near' | 'reached';

/** From this share of the limit on, the counter warns how many characters are left. */
const NEAR_LIMIT_RATIO = 0.9;

export function characterLimitStatus(length: number, maxLength: number): CharacterLimitStatus {
  if (length >= maxLength) return 'reached';
  if (length >= Math.ceil(maxLength * NEAR_LIMIT_RATIO)) return 'near';
  return 'ok';
}

export function limitReachedMessage(maxLength: number): string {
  return `Você atingiu o limite de ${maxLength} caracteres. Para escrever algo novo, apague parte do texto.`;
}

/**
 * Red outline for an MUI outlined input whose text hit the limit (not invalid,
 * just full). Works on the `OutlinedInput` itself or on a wrapping `TextField`.
 */
export const limitReachedOutlineSx = {
  [[
    '& .MuiOutlinedInput-notchedOutline',
    '&:hover .MuiOutlinedInput-notchedOutline',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline',
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline',
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline',
  ].join(', ')]: { borderColor: 'error.main', borderWidth: 2 },
} as const;

type CharacterCounterProps = {
  id: string;
  length: number;
  maxLength: number;
};

/** "12/70 caracteres", turning amber with what is left near the limit and red at it. */
export function CharacterCounter({ id, length, maxLength }: CharacterCounterProps) {
  const status = characterLimitStatus(length, maxLength);
  const remaining = Math.max(maxLength - length, 0);

  return (
    <Typography
      id={id}
      variant="caption"
      sx={{
        flexShrink: 0,
        fontWeight: status === 'ok' ? 400 : 700,
        color: { ok: 'text.secondary', near: 'warning.main', reached: 'error.main' }[status],
      }}
    >
      {length}/{maxLength} caracteres
      {status === 'near' ? ` · ${remaining === 1 ? 'resta 1' : `restam ${remaining}`}` : null}
    </Typography>
  );
}

type CharacterLimitMessageProps = {
  id?: string;
  length: number;
  maxLength: number;
};

/**
 * Explains the limit right under the field once it is reached. The live region
 * stays mounted (empty below the limit) so screen readers announce the message
 * the moment it appears, once, instead of every keystroke.
 */
export function CharacterLimitMessage({ id, length, maxLength }: CharacterLimitMessageProps) {
  const reached = characterLimitStatus(length, maxLength) === 'reached';

  return (
    <Box id={id} role="status" aria-live="polite" aria-atomic="true">
      {reached ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.75,
            mt: 0.5,
            color: 'error.main',
          }}
        >
          <ErrorOutlineRoundedIcon aria-hidden sx={{ fontSize: 18, mt: '1px' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
            {limitReachedMessage(maxLength)}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
