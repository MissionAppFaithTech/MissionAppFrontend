'use client';

import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

export type GenderValue = 'feminino' | 'masculino';

type GenderFieldProps = {
  value?: GenderValue | '';
  onChange: (value: GenderValue) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
};

const radioSx = {
  p: { xs: 1.25, sm: 0.75 },
} as const;

const optionSx = {
  mr: { xs: 1.5, sm: 2 },
  ml: 0,
  my: 0,
  '& .MuiFormControlLabel-label': { typography: 'body2' },
} as const;

export default function GenderField({
  value,
  onChange,
  onBlur,
  error,
  helperText,
}: GenderFieldProps) {
  const labelId = useId();

  return (
    <FormControl
      error={error}
      component="fieldset"
      fullWidth
      sx={{ m: 0, p: 0, minWidth: 0, border: 0 }}
    >
      <FormLabel
        id={labelId}
        component="legend"
        sx={{
          typography: 'body2',
          color: error ? 'error.main' : 'text.secondary',
          mb: 0,
          float: 'none',
          width: 'auto',
        }}
      >
        Gênero
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby={labelId}
        name="gender"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value as GenderValue)}
        onBlur={onBlur}
        sx={{ flexWrap: 'wrap', columnGap: 0, mt: 0 }}
      >
        <FormControlLabel
          value="feminino"
          control={<Radio size="small" sx={radioSx} />}
          label="Feminino"
          sx={optionSx}
        />
        <FormControlLabel
          value="masculino"
          control={<Radio size="small" sx={radioSx} />}
          label="Masculino"
          sx={optionSx}
        />
      </RadioGroup>
      {helperText ? <FormHelperText sx={{ mx: 0 }}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
