'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import GenderField from '@/forms/register/shared/GenderField';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { maskBirthDate, maskCpfOrPassport } from '@/lib/masks';
import { validateOnLeave } from '@/lib/formValidation';
import { personalStepErrors, toFormErrors } from '@/forms/register/shared/fieldErrors';
import { missionaryStep1Schema, type MissionaryStep1FormData } from '@/schemas/register.schema';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { yieldToMain } from '@/lib/scheduler';

export default function MissionariesStep1() {
  const { formData, completeStep1, stepErrors } = useMissionaryRegisterWizard();
  // Read once: the form keeps them until the user fixes each field.
  // NOTE: errors of step 2 wait in the store until the user gets there.
  const [serverErrors] = useState(() => toFormErrors(personalStepErrors(stepErrors)));
  const [showServerErrors] = useState(() => Object.keys(serverErrors).length > 0);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<MissionaryStep1FormData>({
    resolver: zodResolver(missionaryStep1Schema),
    ...validateOnLeave,
    // Errors the API sent back for this step (e.g. e-mail already in use).
    errors: serverErrors,
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
      progress={{ step: 1, total: 3 }}
      isSubmitting={isSubmitting}
      errors={errors}
      submitCount={submitCount}
      showSummary={showServerErrors}
    >
      <TextField
        {...register('fullName')}
        label="Nome completo"
        required
        fullWidth
        placeholder="Maria da Silva"
        slotProps={{
          htmlInput: { autoComplete: 'name', enterKeyHint: 'next' },
        }}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />

      <TextField
        {...register('email')}
        label="E-mail"
        type="email"
        required
        fullWidth
        placeholder="seu@email.com"
        slotProps={{
          htmlInput: {
            autoComplete: 'email',
            inputMode: 'email',
            enterKeyHint: 'next',
            autoCapitalize: 'none',
            autoCorrect: 'off',
            spellCheck: false,
          },
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
            required
            fullWidth
            placeholder="DD/MM/AAAA"
            slotProps={{
              htmlInput: { inputMode: 'numeric', maxLength: 10, enterKeyHint: 'next' },
            }}
            error={Boolean(errors.birthDate)}
            // The format stays visible after the placeholder disappears.
            helperText={errors.birthDate?.message ?? 'Use o formato DD/MM/AAAA'}
            onChange={(event) => field.onChange(maskBirthDate(event.target.value))}
          />
        )}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <GenderField
            required
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
            required
            fullWidth
            slotProps={{
              htmlInput: {
                enterKeyHint: 'next',
                autoCapitalize: 'characters',
                autoCorrect: 'off',
                spellCheck: false,
              },
            }}
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
            required
            name={field.name}
            inputRef={field.ref}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
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
