'use client';

import { Controller, useForm } from 'react-hook-form';
import {
  TextField,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import PhoneField, { isValidInternationalPhone } from '@/components/common/PhoneField';
import { isValidBirthDate, maskBirthDate, maskCpfOrPassport } from '@/lib/masks';
import type { MissionariesStep1Values } from '../types';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

export default function MissionariesStep1() {
  const { formData, completeStep1 } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MissionariesStep1Values>({
    defaultValues: {
      fullName: '',
      birthDate: '',
      gender: '',
      document: '',
      phone: '',
      ...formData,
    },
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(completeStep1)} sx={{ width: '100%' }}>
      <Typography variant="body1">Dados pessoais</Typography>

      <TextField
        {...register('fullName', { required: 'Informe seu nome completo' })}
        label="Nome completo"
        fullWidth
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />

      <Controller
        name="birthDate"
        control={control}
        rules={{
          required: 'Informe sua data de nascimento',
          validate: (value) => isValidBirthDate(value) || 'Use o formato DD/MM/AAAA',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Data de nascimento"
            fullWidth
            placeholder="DD/MM/AAAA"
            slotProps={{
              htmlInput: { inputMode: 'numeric', maxLength: 10 },
            }}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate?.message}
            onChange={(event) => field.onChange(maskBirthDate(event.target.value))}
          />
        )}
      />

      <Controller
        name="gender"
        control={control}
        rules={{ required: 'Selecione o gênero' }}
        render={({ field }) => (
          <FormControl error={Boolean(errors.gender)} component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ typography: 'body2', color: 'text.primary', mb: 0.5 }}
            >
              Gênero
            </FormLabel>
            <RadioGroup row {...field} value={field.value}>
              <FormControlLabel value="feminino" control={<Radio />} label="Feminino" />
              <FormControlLabel value="masculino" control={<Radio />} label="Masculino" />
            </RadioGroup>
            {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
          </FormControl>
        )}
      />

      <Controller
        name="document"
        control={control}
        rules={{ required: 'Informe CPF ou passaporte' }}
        render={({ field }) => (
          <TextField
            {...field}
            label="CPF ou passaporte"
            fullWidth
            placeholder="000.000.000-00 ou AB1234567"
            error={Boolean(errors.document)}
            helperText={errors.document?.message}
            onChange={(event) => field.onChange(maskCpfOrPassport(event.target.value))}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        rules={{
          validate: (value) => {
            if (!value.replace(/\D/g, '')) return 'Informe seu telefone';
            return isValidInternationalPhone(value) || 'Informe um telefone válido';
          },
        }}
        render={({ field }) => (
          <PhoneField
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            defaultCountry="br"
          />
        )}
      />

      <Button type="submit" variant="contained" color="primary">
        Continuar
      </Button>
    </Stack>
  );
}
