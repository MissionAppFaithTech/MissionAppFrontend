'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Typography } from '@mui/material';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import CreateMissionaryAgencyModal from '@/forms/register/shared/CreateMissionaryAgencyModal';
import { toFormErrors } from '@/forms/register/shared/fieldErrors';
import CatalogAutocomplete from '@/forms/register/shared/CatalogAutocomplete';
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

export default function MissionariesStep2() {
  const { formData, completeStep2, goBack, stepErrors } = useMissionaryRegisterWizard();
  // Read once: the form keeps them until the user fixes each field.
  const [serverErrors] = useState(() => toFormErrors(stepErrors));
  const [showServerErrors] = useState(() => Object.keys(stepErrors).length > 0);
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
      missionaryAgencyName: formData.missionaryAgencyName || '',
      agencyDetails: formData.agencyDetails || EMPTY_MISSIONARY_AGENCY,
      missionDescription: formData.missionDescription || '',
      faithCommunity: formData.faithCommunity || '',
      faithCommunityName: formData.faithCommunityName || '',
      communityDetails: formData.communityDetails || EMPTY_FAITH_COMMUNITY,
    },
  });

  const agencyDetails = watch('agencyDetails');
  const communityDetails = watch('communityDetails');
  const agencyName = watch('missionaryAgencyName');
  const communityName = watch('faithCommunityName');

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
          <CatalogAutocomplete
            id="missionaryAgency"
            kind="missionaryAgencies"
            label="Agência missionária"
            required
            // NOTE: focus moving into the sign-up modal is not leaving the field
            onBlur={() => {
              if (!agencyEntry.open) field.onBlur();
            }}
            value={field.value}
            selectedName={agencyName}
            onChange={(value, item) => {
              field.onChange(value);
              setValue('missionaryAgencyName', item?.name ?? '');
            }}
            onAddNew={(typedName) => {
              // NOTE: o modal abre já com o nome que a pessoa digitou na busca
              if (typedName) setValue('agencyDetails', { ...agencyDetails, name: typedName });
              agencyEntry.selectValue(SELECT_OTHER, field.value, field.onChange);
            }}
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
          <CatalogAutocomplete
            id="faithCommunity"
            kind="faithCommunities"
            label="Comunidade de fé"
            required
            // NOTE: focus moving into the sign-up modal is not leaving the field
            onBlur={() => {
              if (!communityEntry.open) field.onBlur();
            }}
            value={field.value}
            selectedName={communityName}
            onChange={(value, item) => {
              field.onChange(value);
              setValue('faithCommunityName', item?.name ?? '');
            }}
            onAddNew={(typedName) => {
              if (typedName) setValue('communityDetails', { ...communityDetails, name: typedName });
              communityEntry.selectValue(SELECT_OTHER, field.value, field.onChange);
            }}
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
            // NOTE: a field already in error is checked again, never left red without text
            (value) =>
              setValue('missionaryAgency', value, {
                shouldValidate: Boolean(errors.missionaryAgency),
              })
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
            // NOTE: a field already in error is checked again, never left red without text
            (value) =>
              setValue('faithCommunity', value, { shouldValidate: Boolean(errors.faithCommunity) })
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
