'use client';

import { Box, FormHelperText, InputLabel, useTheme } from '@mui/material';
import { v } from '@/theme/theme';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
  defaultCountry?: string;
};

/** Valor só com DDI (ex: +55) — conta como vazio para mostrar o placeholder. */
function isOnlyDialCode(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return true;
  return /^\+\d{1,4}$/.test(trimmed);
}

export default function PhoneField({
  value,
  onChange,
  error,
  helperText,
  label = 'Telefone',
  placeholder = '(11) 98765-4321',
  defaultCountry = 'br',
}: PhoneFieldProps) {
  const theme = useTheme();
  // `v` reads through `theme.vars` so values follow the active color scheme —
  // reading `theme.palette.*` directly would freeze the default scheme — and it
  // tolerates the custom palette keys being absent, which is the case in unit
  // tests that render against MUI's default theme.
  const borderColor = error ? v(theme, 'palette.error.main') : v(theme, 'palette.divider');

  const displayValue = isOnlyDialCode(value) ? '' : value;

  return (
    <Box sx={{ width: '100%' }}>
      <InputLabel
        shrink
        error={error}
        sx={{ typography: 'body2', color: 'text.primary', mb: 0.75, display: 'block' }}
      >
        {label}
      </InputLabel>

      <Box
        sx={{
          width: '100%',
          border: '1px solid',
          borderColor,
          borderRadius: 1,
          // Matches the field fill used by every other input in the app.
          bgcolor: 'var(--mui-palette-action2-fieldBg)',
          px: 1,
          py: 0.25,
          transition: 'border-color 0.2s ease',
          '&:focus-within': {
            borderColor: error
              ? v(theme, 'palette.error.main')
              : v(theme, 'palette.connection.main'),
            borderWidth: 2,
            px: '7px',
            py: '1px',
          },
          '& .react-international-phone-input-container': {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          '& .react-international-phone-country-selector-button': {
            border: 'none',
            background: 'transparent',
            padding: '8px 4px',
            minHeight: 44,
          },
          '& .react-international-phone-input': {
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            font: 'inherit',
            fontSize: '1rem',
            py: 1.25,
            px: 0.5,
            minHeight: 44,
            color: v(theme, 'palette.text.primary'),
            '&::placeholder': {
              color: v(theme, 'palette.text.secondary'),
              opacity: 1,
            },
          },
        }}
      >
        <PhoneInput
          defaultCountry={defaultCountry}
          value={displayValue}
          onChange={(phone) => onChange(phone)}
          placeholder={placeholder}
        />
      </Box>

      {helperText ? <FormHelperText error={error}>{helperText}</FormHelperText> : null}
    </Box>
  );
}

export function isValidInternationalPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  // DDI BR (55) + DDD (2) + número (8–9) ≈ 12–13 dígitos no total
  return digits.length >= 10;
}
