'use client';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { SELECT_OTHER } from '@/forms/register/options';
import type { CatalogItem } from '@/services/catalog.service';

type RegisterCatalogSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogItem[];
  isLoading?: boolean;
  loadError?: string | null;
  error?: boolean;
  helperText?: string;
  emptyValueLabel?: string;
  allowEmpty?: boolean;
};

export default function RegisterCatalogSelect({
  id,
  label,
  value,
  onChange,
  options,
  isLoading = false,
  loadError,
  error,
  helperText,
  emptyValueLabel = 'Selecione...',
  allowEmpty = false,
}: RegisterCatalogSelectProps) {
  const labelId = `${id}-label`;
  const showError = Boolean(error || loadError);
  const message = helperText || loadError || undefined;

  return (
    <FormControl fullWidth error={showError} disabled={isLoading}>
      <InputLabel id={labelId} shrink>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        displayEmpty
      >
        <MenuItem value="" disabled={!allowEmpty}>
          {isLoading ? 'Carregando...' : emptyValueLabel}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
        <MenuItem value={SELECT_OTHER}>Não encontrei na lista</MenuItem>
      </Select>
      {message ? <FormHelperText>{message}</FormHelperText> : null}
    </FormControl>
  );
}
