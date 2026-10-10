'use client';

import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { CountrySelector, usePhoneInput } from 'react-international-phone';
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
  error = false,
  helperText,
  label = 'Telefone',
  placeholder = '(11) 98765-4321',
  defaultCountry = 'br',
}: PhoneFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const displayValue = isOnlyDialCode(value) ? '' : value;

  const { inputValue, country, setCountry, handlePhoneValueChange } = usePhoneInput({
    defaultCountry,
    value: displayValue,
    onChange: (data) => onChange(data.phone),
  });

  return (
    <FormControl variant="outlined" fullWidth error={error}>
      <InputLabel htmlFor={inputId} shrink>
        {label}
      </InputLabel>
      <OutlinedInput
        id={inputId}
        label={label}
        notched
        value={inputValue}
        onChange={handlePhoneValueChange}
        placeholder={placeholder}
        autoComplete="tel"
        inputMode="tel"
        aria-invalid={error}
        aria-describedby={helperText ? helperId : undefined}
        startAdornment={
          <InputAdornment position="start" sx={{ mr: 0.5 }}>
            <CountrySelector
              selectedCountry={country.iso2}
              onSelect={(selected) => setCountry(selected.iso2)}
              renderButtonWrapper={({ children, rootProps }) => (
                <button
                  type="button"
                  {...rootProps}
                  aria-label={`País do telefone: ${country.name}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 44,
                    minHeight: 44,
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {children}
                </button>
              )}
            />
          </InputAdornment>
        }
        sx={{
          overflow: 'visible',
          bgcolor: 'var(--mui-palette-action2-fieldBg)',
        }}
      />
      {helperText ? <FormHelperText id={helperId}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export function isValidInternationalPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  // DDI BR (55) + DDD (2) + número (8–9) ≈ 12–13 dígitos no total
  return digits.length >= 10;
}
