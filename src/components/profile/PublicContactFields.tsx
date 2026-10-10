'use client';

import { Controller, type Control, type FieldErrors, type Path } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InfoAlert from '@/components/common/InfoAlert';
import PhoneField from '@/components/common/PhoneField';

export type PublicContactFormValues = {
  publicEmail: string;
  publicPhone: string;
  showPublicEmail: boolean;
  showPublicPhone: boolean;
  allowWhatsappContact: boolean;
};

type PublicContactFieldsProps<T extends PublicContactFormValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

const fieldLabelSx = {
  color: 'primary.main',
  fontWeight: 600,
} as const;

const checkboxSx = {
  m: 0,
  alignItems: 'center',
  minWidth: 0,
  '& .MuiCheckbox-root': {
    minWidth: 44,
    minHeight: 44,
  },
  '& .MuiFormControlLabel-label': {
    typography: 'body2',
    color: 'text.primary',
  },
} as const;

export default function PublicContactFields<T extends PublicContactFormValues>({
  control,
  errors,
}: PublicContactFieldsProps<T>) {
  const emailError =
    typeof errors.publicEmail?.message === 'string' ? errors.publicEmail.message : undefined;
  const phoneError =
    typeof errors.publicPhone?.message === 'string' ? errors.publicPhone.message : undefined;

  return (
    <Stack spacing={{ xs: 2, sm: 2 }}>
      <Typography
        variant="subtitle1"
        component="h3"
        color="primary.main"
        sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
      >
        Informações de contato
      </Typography>
      <InfoAlert>
        Essas informações serão exibidas publicamente para visitantes e apoiadores.
      </InfoAlert>

      <Stack spacing={0.5}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            component="label"
            htmlFor="publicEmail"
            variant="body2"
            sx={fieldLabelSx}
          >
            E-mail:
          </Typography>
          <Controller
            name={'publicEmail' as Path<T>}
            control={control}
            render={({ field }) => (
              <TextField
                id="publicEmail"
                type="email"
                size="small"
                fullWidth
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="exemplo@dominio.com"
                autoComplete="email"
                error={Boolean(emailError)}
                helperText={emailError}
                slotProps={{
                  htmlInput: {
                    inputMode: 'email',
                    'aria-invalid': Boolean(emailError) || undefined,
                    'aria-describedby': emailError ? 'publicEmail-helper-text' : undefined,
                  },
                  formHelperText: { id: 'publicEmail-helper-text' },
                }}
              />
            )}
          />
        </Stack>

        <Controller
          name={'showPublicEmail' as Path<T>}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={checkboxSx}
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                />
              }
              label="Exibir e-mail no meu perfil"
            />
          )}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            component="label"
            htmlFor="publicPhone"
            variant="body2"
            sx={fieldLabelSx}
          >
            Telefone:
          </Typography>
          <Controller
            name={'publicPhone' as Path<T>}
            control={control}
            render={({ field }) => (
              <PhoneField
                id="publicPhone"
                hideLabel
                size="small"
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={field.onChange}
                error={Boolean(phoneError)}
                helperText={phoneError}
                placeholder="(21) 98765-4321"
                defaultCountry="br"
              />
            )}
          />
        </Stack>

        <Controller
          name={'showPublicPhone' as Path<T>}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={checkboxSx}
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                />
              }
              label="Exibir telefone no meu perfil"
            />
          )}
        />
        <Controller
          name={'allowWhatsappContact' as Path<T>}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={checkboxSx}
              control={
                <Checkbox
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                />
              }
              label="Este número é um número de WhatsApp"
            />
          )}
        />
      </Stack>
    </Stack>
  );
}
