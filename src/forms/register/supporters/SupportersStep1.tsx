'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import { useSupporterRegisterWizard } from '@/components/register/supporters/SupporterRegisterWizardContext';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import GenderField from '@/forms/register/shared/GenderField';
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { useCatalogItems } from '@/forms/register/shared/useCatalogItems';
import { useOtherCatalogEntry } from '@/forms/register/shared/useOtherCatalogEntry';
import { EMPTY_FAITH_COMMUNITY, SELECT_OTHER } from '@/forms/register/options';
import { maskBirthDate } from '@/lib/masks';
import { validateOnSubmit, withLiveEmailFormat } from '@/lib/formValidation';
import { yieldToMain } from '@/lib/scheduler';
import { createFaithCommunitySchema } from '@/schemas/catalog-create.schema';
import { supporterStep1Schema, type SupporterStep1FormData } from '@/schemas/register.schema';
import { listFaithCommunities } from '@/services/catalog.service';

export default function SupportersStep1() {
  const { formData, completeStep1 } = useSupporterRegisterWizard();
  const communities = useCatalogItems(listFaithCommunities);
  const communityEntry = useOtherCatalogEntry();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    clearErrors,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<SupporterStep1FormData>({
    resolver: zodResolver(supporterStep1Schema),
    ...validateOnSubmit,
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

      <Controller
        name="faithCommunity"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="faithCommunity"
            label="Comunidade de fé (opcional)"
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
