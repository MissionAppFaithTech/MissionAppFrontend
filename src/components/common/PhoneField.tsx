'use client';

import { useId, type ChangeEvent, type Ref } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { CountrySelector, usePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

type PhoneFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  /** When true, the caller renders the visible label (e.g. Typography + htmlFor). */
  hideLabel?: boolean;
  placeholder?: string;
  defaultCountry?: string;
  size?: 'small' | 'medium';
  /** Lets react-hook-form focus the input on validation errors. */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * The field hides the bare dial code to show the placeholder, so a number pasted or
 * autofilled without "+" would be read as international ("21…" → +21). Treat it as a
 * national number of the selected country instead; keep it if it already carries the code.
 */
export function withDialCode(raw: string, dialCode: string): string {
  const trimmed = raw.trimStart();
  if (!trimmed || trimmed.startsWith('+')) return raw;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return raw;
  // E.164 national numbers have at most 12 digits here; longer input already includes the code.
  if (digits.startsWith(dialCode) && digits.length > 11) return `+${digits}`;
  return `+${dialCode}${digits}`;
}

/** Valor só com DDI (ex: +55) — conta como vazio para mostrar o placeholder. */
function isOnlyDialCode(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return true;
  return /^\+\d{1,4}$/.test(trimmed);
}

export default function PhoneField({
  inputRef,
  id,
  value,
  onChange,
  error = false,
  helperText,
  label = 'Telefone',
  hideLabel = false,
  placeholder = '(11) 98765-4321',
  defaultCountry = 'br',
  size = 'medium',
}: PhoneFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = useId();
  const displayValue = isOnlyDialCode(value) ? '' : value;

  const { inputValue, country, setCountry, handlePhoneValueChange } = usePhoneInput({
    defaultCountry,
    value: displayValue,
    onChange: (data) => onChange(data.phone),
  });

  return (
    <FormControl variant="outlined" fullWidth error={error} size={size}>
      {hideLabel ? null : (
        <InputLabel htmlFor={inputId} shrink>
          {label}
        </InputLabel>
      )}
      <OutlinedInput
        id={inputId}
        inputRef={inputRef}
        label={hideLabel ? undefined : label}
        notched={hideLabel ? false : true}
        size={size}
        value={inputValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const normalized = withDialCode(event.target.value, country.dialCode);
          if (normalized !== event.target.value) event.target.value = normalized;
          handlePhoneValueChange(event);
        }}
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
