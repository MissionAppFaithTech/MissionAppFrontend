'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Typography } from '@mui/material';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import CreateMissionaryAgencyModal from '@/forms/register/shared/CreateMissionaryAgencyModal';
import { toFormErrors } from '@/forms/register/shared/fieldErrors';
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import RegisterStepForm from '@/forms/register/shared/RegisterStepForm';
import { useOtherCatalogEntry } from '@/forms/register/shared/useOtherCatalogEntry';
import {
  EMPTY_FAITH_COMMUNITY,
  EMPTY_MISSIONARY_AGENCY,
  SELECT_OTHER,
} from '@/forms/register/options';
import { validateOnLeave } from '@/lib/formValidation';
import { yieldToMain } from '@/lib/scheduler';
import {
  createFaithCommunitySchema,
  createMissionaryAgencySchema,
} from '@/schemas/catalog-create.schema';
import { missionaryStep2Schema, type MissionaryStep2FormData } from '@/schemas/register.schema';
import { useCatalogItems } from '@/services/queries/catalog';

export default function MissionariesStep2() {
  const { formData, completeStep2, goBack, stepErrors } = useMissionaryRegisterWizard();
  // Read once: the form keeps them until the user fixes each field.
  const [serverErrors] = useState(() => toFormErrors(stepErrors));
  const [showServerErrors] = useState(() => Object.keys(stepErrors).length > 0);
  const agencies = useCatalogItems('missionaryAgencies');
  const communities = useCatalogItems('faithCommunities');
  const agencyEntry = useOtherCatalogEntry();
  const communityEntry = useOtherCatalogEntry();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<MissionaryStep2FormData>({
    resolver: zodResolver(missionaryStep2Schema),
    ...validateOnLeave,
    // Errors the API sent back for this step (e.g. an agency that no longer exists).
    errors: serverErrors,
    defaultValues: {
      missionaryAgency: formData.missionaryAgency || '',
      agencyDetails: formData.agencyDetails || EMPTY_MISSIONARY_AGENCY,
      missionDescription: formData.missionDescription || '',
      faithCommunity: formData.faithCommunity || '',
      communityDetails: formData.communityDetails || EMPTY_FAITH_COMMUNITY,
    },
  });

  const agencyDetails = watch('agencyDetails');
  const communityDetails = watch('communityDetails');

  const handleStepSubmit = async (data: MissionaryStep2FormData) => {
    await yieldToMain();
    completeStep2(data);
  };

  return (
    <RegisterStepForm
      onSubmit={handleSubmit(handleStepSubmit)}
      sectionTitle="Dados ministeriais"
      progress={{ step: 2, total: 3 }}
      onBack={goBack}
      isSubmitting={isSubmitting}
      errors={errors}
      submitCount={submitCount}
      showSummary={showServerErrors}
    >
      <Controller
        name="missionaryAgency"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="missionaryAgency"
            label="Agência missionária"
            required
            onBlur={field.onBlur}
            value={field.value}
            onChange={(value) => agencyEntry.selectValue(value, field.value, field.onChange)}
            options={agencies.items}
            isLoading={agencies.isLoading}
            loadError={agencies.error}
            error={Boolean(errors.missionaryAgency)}
            helperText={errors.missionaryAgency?.message}
            otherSummary={field.value === SELECT_OTHER ? agencyDetails.name : undefined}
            onEditOther={agencyEntry.openEditor}
          />
        )}
      />

      <TextField
        {...register('missionDescription')}
        label="Projeto ou atuação missionária"
        required
        fullWidth
        multiline
        minRows={3}
        placeholder="Descreva com breves palavras seu projeto ou atuação missionária"
        error={Boolean(errors.missionDescription)}
        helperText={errors.missionDescription?.message}
      />

      <Typography component="h3" variant="body1" sx={{ fontWeight: 600 }}>
        Dados da comunidade de fé
      </Typography>

      <Controller
        name="faithCommunity"
        control={control}
        render={({ field }) => (
          <RegisterCatalogSelect
            id="faithCommunity"
            label="Comunidade de fé"
            required
            onBlur={field.onBlur}
            value={field.value}
            onChange={(value) => communityEntry.selectValue(value, field.value, field.onChange)}
            options={communities.items}
            isLoading={communities.isLoading}
            loadError={communities.error}
            error={Boolean(errors.faithCommunity)}
            helperText={errors.faithCommunity?.message}
            otherSummary={field.value === SELECT_OTHER ? communityDetails.name : undefined}
            onEditOther={communityEntry.openEditor}
          />
        )}
      />

      <CreateMissionaryAgencyModal
        open={agencyEntry.open}
        initialValues={agencyDetails}
        onClose={() =>
          agencyEntry.cancel(
            createMissionaryAgencySchema.safeParse(agencyDetails).success,
            (value) => setValue('missionaryAgency', value)
          )
        }
        onSave={(details) => {
          setValue('agencyDetails', details);
          setValue('missionaryAgency', SELECT_OTHER, { shouldValidate: true });
          agencyEntry.close();
        }}
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
