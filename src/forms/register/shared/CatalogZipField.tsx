'use client';

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { isCompleteBrazilianCep } from '@/lib/masks';
import type { CepLookupStatus } from '@/hooks/useCepAutofill';

type CatalogZipFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSearch: () => void;
  status: CepLookupStatus;
  helperText?: string;
  error?: boolean;
};

export default function CatalogZipField({
  id,
  value,
  onChange,
  onBlur,
  onSearch,
  status,
  helperText,
  error = false,
}: CatalogZipFieldProps) {
  const canSearch = isCompleteBrazilianCep(value) && status !== 'checking';

  return (
    <TextField
      id={id}
      label="CEP ou código postal"
      placeholder="00000-000"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      fullWidth
      autoComplete="postal-code"
      inputMode="numeric"
      error={error || status === 'notFound' || status === 'error'}
      helperText={helperText}
      slotProps={{
        formHelperText: { role: status === 'idle' ? undefined : 'status' },
        htmlInput: { inputMode: 'numeric', maxLength: 9 },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label="Buscar endereço pelo CEP"
                onClick={onSearch}
                disabled={!canSearch}
                sx={{ width: 44, height: 44 }}
              >
                {status === 'checking' ? (
                  <CircularProgress size={20} aria-hidden />
                ) : (
                  <SearchIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
