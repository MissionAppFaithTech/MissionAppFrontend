'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import { useSupporterRegisterWizard } from '@/components/register/supporters/SupporterRegisterWizardContext';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import GenderField from '@/forms/register/shared/GenderField';
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { useOtherCatalogEntry } from '@/forms/register/shared/useOtherCatalogEntry';
import { EMPTY_FAITH_COMMUNITY, SELECT_OTHER } from '@/forms/register/options';
import { maskBirthDate } from '@/lib/masks';
import { validateOnLeave } from '@/lib/formValidation';
import { toFormErrors } from '@/forms/register/shared/fieldErrors';
import { yieldToMain } from '@/lib/scheduler';
import { createFaithCommunitySchema } from '@/schemas/catalog-create.schema';
import { supporterStep1Schema, type SupporterStep1FormData } from '@/schemas/register.schema';
import { useCatalogItems } from '@/services/queries/catalog';

export default function SupportersStep1() {
  const { formData, completeStep1, stepErrors } = useSupporterRegisterWizard();
  // Read once: the form keeps them until the user fixes each field.
  const [serverErrors] = useState(() => toFormErrors(stepErrors));
  const [showServerErrors] = useState(() => Object.keys(stepErrors).length > 0);
  const communities = useCatalogItems('faithCommunities');
  const communityEntry = useOtherCatalogEntry();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<SupporterStep1FormData>({
    resolver: zodResolver(supporterStep1Schema),
    ...validateOnLeave,
    // Errors the API sent back for this step (e.g. e-mail already in use).
    errors: serverErrors,
    defaultValues: {
      fullName: formData.fullName || '',
      email: formData.email || '',
      birthDate: formData.birthDate || '',
      gender: (formData.gender as 'feminino' | 'masculino') || undefined,
      phone: formData.phone || '',
      faithCommunity: formData.faithCommunity || '',
      communityDetails: formData.communityDetails || EMPTY_FAITH_COMMUNITY,
    },
  });

  const communityDetails = watch('communityDetails');

  const handleStepSubmit = async (data: SupporterStep1FormData) => {
    await yieldToMain();
    completeStep1(data);
  };

  return (
    <RegisterStepForm
      onSubmit={handleSubmit(handleStepSubmit)}
      sectionTitle="Dados pessoais"
      progress={{ step: 1, total: 2 }}
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

      <Controller
        name="faithCommunity"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="faithCommunity"
            label="Comunidade de fé (opcional)"
            onBlur={field.onBlur}
            value={field.value}
            onChange={(value) => communityEntry.selectValue(value, field.value, field.onChange)}
            options={communities.items}
            isLoading={communities.isLoading}
            loadError={communities.error}
            error={Boolean(errors.faithCommunity)}
            helperText={errors.faithCommunity?.message}
            emptyValueLabel="Nenhuma"
            allowEmpty
            otherSummary={field.value === SELECT_OTHER ? communityDetails.name : undefined}
            onEditOther={communityEntry.openEditor}
          />
        )}
      />

      <CreateFaithCommunityModal
        open={communityEntry.open}
        initialValues={communityDetails}
        onClose={() =>
          communityEntry.cancel(
            createFaithCommunitySchema.safeParse(communityDetails).success,
            (value) => setValue('faithCommunity', value)
          )
        }
        onSave={(details) => {
          setValue('communityDetails', details);
          setValue('faithCommunity', SELECT_OTHER, { shouldValidate: true });
          communityEntry.close();
        }}
      />
    </RegisterStepForm>
  );
}
