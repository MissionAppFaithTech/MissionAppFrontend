'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import GenderField from '@/forms/register/shared/GenderField';
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { useCatalogItems } from '@/forms/register/shared/useCatalogItems';
import { maskBirthDate } from '@/lib/masks';
import { validateOnSubmit, withLiveEmailFormat } from '@/lib/formValidation';
import { supporterStep1Schema, type SupporterStep1FormData } from '@/schemas/register.schema';
import { useSupporterRegisterWizard } from '@/components/register/supporters/SupporterRegisterWizardContext';
import { SELECT_OTHER } from '@/forms/register/options';
import { listFaithCommunities } from '@/services/catalog.service';
import { yieldToMain } from '@/lib/scheduler';

export default function SupportersStep1() {
  const { formData, completeStep1 } = useSupporterRegisterWizard();
  const communities = useCatalogItems(listFaithCommunities);
  const {
    register,
    handleSubmit,
    control,
    watch,
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
      communityPhone: formData.communityPhone || '',
      pastorName: formData.pastorName || '',
      pastorPhone: formData.pastorPhone || '',
    },
  });

  const faithCommunity = watch('faithCommunity');
  const showCommunityDetails = faithCommunity === SELECT_OTHER;

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
            onChange={field.onChange}
            options={communities.items}
            isLoading={communities.isLoading}
            loadError={communities.error}
            emptyValueLabel="Nenhuma"
            allowEmpty
          />
        )}
      />

      {showCommunityDetails ? (
        <>
          <Controller
            name="communityPhone"
            control={control}
            render={({ field }) => (
              <PhoneField
                label="Telefone da comunidade de fé"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.communityPhone)}
                helperText={errors.communityPhone?.message}
                placeholder="(11) 98765-4321"
                defaultCountry="br"
              />
            )}
          />

          <TextField
            {...register('pastorName')}
            label="Nome do pastor"
            fullWidth
            placeholder="Pr. João Souza"
            error={Boolean(errors.pastorName)}
            helperText={errors.pastorName?.message}
          />

          <Controller
            name="pastorPhone"
            control={control}
            render={({ field }) => (
              <PhoneField
                label="Telefone do pastor"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.pastorPhone)}
                helperText={errors.pastorPhone?.message}
                placeholder="(11) 98765-4321"
                defaultCountry="br"
              />
            )}
          />
        </>
      ) : null}

    </RegisterStepForm>
  );
}
