'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import PillButton from '@/components/common/PillButton';
import PhoneField from '@/components/common/PhoneField';
import { maskBirthDate, maskCpfOrPassport } from '@/lib/masks';
import { missionaryStep1Schema, type MissionaryStep1FormData } from '@/schemas/register.schema';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { yieldToMain } from '@/lib/scheduler';

export default function MissionariesStep1() {
  const { formData, completeStep1 } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MissionaryStep1FormData>({
    resolver: zodResolver(missionaryStep1Schema),
    mode: 'onTouched',
    defaultValues: {
      fullName: formData.fullName || '',
      email: formData.email || '',
      birthDate: formData.birthDate || '',
      gender: (formData.gender as 'feminino' | 'masculino') || undefined,
      document: formData.document || '',
      phone: formData.phone || '',
    },
  });

  const handleStepSubmit = async (data: MissionaryStep1FormData) => {
    await yieldToMain();
    completeStep1(data);
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(handleStepSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body1">Dados pessoais</Typography>

      <TextField
        {...register('fullName')}
        label="Nome completo"
        fullWidth
        placeholder="Maria da Silva"
        slotProps={{
          htmlInput: { autoComplete: 'name' },
        }}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />

      <TextField
        {...register('email')}
        label="E-mail"
        type="email"
        fullWidth
        placeholder="seu@email.com"
        slotProps={{
          htmlInput: { autoComplete: 'email', inputMode: 'email' },
        }}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />

      <Controller
        name="birthDate"
        control={control}
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
        render={({ field }) => (
          <FormControl error={Boolean(errors.gender)} component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ typography: 'body2', color: 'text.primary', mb: 0.5 }}
            >
              Gênero
            </FormLabel>
            <RadioGroup row {...field} value={field.value ?? ''}>
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
        render={({ field }) => (
          <PhoneField
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            placeholder="(11) 98765-4321"
            defaultCountry="br"
          />
        )}
      />

      <PillButton
        type="submit"
        tone="cta"
        disabled={isSubmitting}
        fullWidth
        sx={{
          minHeight: 48,
          fontSize: '1rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} color="inherit" aria-label="Enviando dados" />
            <span>Continuando...</span>
          </>
        ) : (
          'Continuar'
        )}
      </PillButton>
    </Stack>
  );
}
