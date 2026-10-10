'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Typography } from '@mui/material';
import PhoneField from '@/components/common/PhoneField';
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { useCatalogItems } from '@/forms/register/shared/useCatalogItems';
import { validateOnSubmit } from '@/lib/formValidation';
import { missionaryStep2Schema, type MissionaryStep2FormData } from '@/schemas/register.schema';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { SELECT_OTHER } from '@/forms/register/options';
import { listFaithCommunities, listMissionaryAgencies } from '@/services/catalog.service';
import { yieldToMain } from '@/lib/scheduler';

export default function MissionariesStep2() {
  const { formData, completeStep2, goBack } = useMissionaryRegisterWizard();
  const agencies = useCatalogItems(listMissionaryAgencies);
  const communities = useCatalogItems(listFaithCommunities);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MissionaryStep2FormData>({
    resolver: zodResolver(missionaryStep2Schema),
    ...validateOnSubmit,
    defaultValues: {
      missionaryAgency: formData.missionaryAgency || '',
      agencyCustomName: formData.agencyCustomName || '',
      agencyPhone: formData.agencyPhone || '',
      missionDescription: formData.missionDescription || '',
      faithCommunity: formData.faithCommunity || '',
      communityPhone: formData.communityPhone || '',
      pastorName: formData.pastorName || '',
      pastorPhone: formData.pastorPhone || '',
    },
  });

  const missionaryAgency = watch('missionaryAgency');
  const faithCommunity = watch('faithCommunity');
  const showAgencyDetails = missionaryAgency === SELECT_OTHER;
  const showCommunityDetails = faithCommunity === SELECT_OTHER;

  const handleStepSubmit = async (data: MissionaryStep2FormData) => {
    await yieldToMain();
    completeStep2(data);
  };

  return (
    <RegisterStepForm
      onSubmit={handleSubmit(handleStepSubmit)}
      sectionTitle="Dados ministeriais"
      onBack={goBack}
      isSubmitting={isSubmitting}
    >

      <Controller
        name="missionaryAgency"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="missionaryAgency"
            label="Agência missionária"
            value={field.value}
            onChange={field.onChange}
            options={agencies.items}
            isLoading={agencies.isLoading}
            loadError={agencies.error}
            error={Boolean(errors.missionaryAgency)}
            helperText={errors.missionaryAgency?.message}
          />
        )}
      />

      {showAgencyDetails ? (
        <>
          <TextField
            {...register('agencyCustomName')}
            label="Nome da agência missionária"
            fullWidth
            placeholder="Nome da sua agência"
            error={Boolean(errors.agencyCustomName)}
            helperText={errors.agencyCustomName?.message}
          />

          <Controller
            name="agencyPhone"
            control={control}
            render={({ field }) => (
              <PhoneField
                label="Telefone da agência missionária"
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.agencyPhone)}
                helperText={errors.agencyPhone?.message}
                placeholder="(11) 98765-4321"
                defaultCountry="br"
              />
            )}
          />
        </>
      ) : null}

      <TextField
        {...register('missionDescription')}
        label="Projeto ou atuação missionária"
        fullWidth
        multiline
        minRows={3}
        placeholder="Descreva com breves palavras seu projeto ou atuação missionária"
        error={Boolean(errors.missionDescription)}
        helperText={errors.missionDescription?.message}
      />

      <Typography variant="body1">Dados da comunidade de fé</Typography>

      <Controller
        name="faithCommunity"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="faithCommunity"
            label="Comunidade de fé"
            value={field.value}
            onChange={field.onChange}
            options={communities.items}
            isLoading={communities.isLoading}
            loadError={communities.error}
            error={Boolean(errors.faithCommunity)}
            helperText={errors.faithCommunity?.message}
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
