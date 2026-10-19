'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import GenderField from '@/forms/register/shared/GenderField';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { maskBirthDate, maskCpfOrPassport } from '@/lib/masks';
import { validateOnSubmit, withLiveEmailFormat } from '@/lib/formValidation';
import { missionaryStep1Schema, type MissionaryStep1FormData } from '@/schemas/register.schema';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { yieldToMain } from '@/lib/scheduler';

export default function MissionariesStep1() {
  const { formData, completeStep1 } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    trigger,
    clearErrors,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<MissionaryStep1FormData>({
    resolver: zodResolver(missionaryStep1Schema),
    ...validateOnSubmit,
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
    <RegisterStepForm
      onSubmit={handleSubmit(handleStepSubmit)}
      sectionTitle="Dados pessoais"
      isSubmitting={isSubmitting}
    >
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
        {...withLiveEmailFormat(register('email'), { trigger, clearErrors, getFieldState })}
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
          <GenderField
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={Boolean(errors.gender)}
            helperText={errors.gender?.message}
          />
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
    </RegisterStepForm>
  );
}
