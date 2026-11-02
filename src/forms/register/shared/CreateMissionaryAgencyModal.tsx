'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PhoneField from '@/components/common/PhoneField';
import CatalogCreateDialog from '@/forms/register/shared/CatalogCreateDialog';
import CatalogZipField from '@/forms/register/shared/CatalogZipField';
import { EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';
import { applyCepAddress, useCepAutofill } from '@/hooks/useCepAutofill';
import { maskCep } from '@/lib/masks';
import { validateOnSubmit } from '@/lib/formValidation';
import {
  createMissionaryAgencySchema,
  type CreateMissionaryAgencyFormData,
} from '@/schemas/catalog-create.schema';
import type { MissionaryAgencyData } from '@/types/account';

type CreateMissionaryAgencyModalProps = {
  open: boolean;
  initialValues?: Partial<MissionaryAgencyData>;
  onClose: () => void;
  onSave: (data: CreateMissionaryAgencyFormData) => void;
};

export default function CreateMissionaryAgencyModal({
  open,
  initialValues,
  onClose,
  onSave,
}: CreateMissionaryAgencyModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateMissionaryAgencyFormData>({
    resolver: zodResolver(createMissionaryAgencySchema),
    ...validateOnSubmit,
    defaultValues: { ...EMPTY_MISSIONARY_AGENCY, ...initialValues },
  });

  const zipCode = watch('zipCode');
  const { status, message, search } = useCepAutofill({
    zipCode,
    enabled: open,
    onAddress: (address) => applyCepAddress(setValue, address),
  });

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_MISSIONARY_AGENCY, ...initialValues });
    }
    // NOTE: só reidrata ao abrir — senão o reset apaga o que a pessoa está digitando
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValues é um snapshot da abertura
  }, [open, reset]);

  return (
    <CatalogCreateDialog
      open={open}
      title="Cadastrar agência missionária"
      description="Informe os dados obrigatórios da agência. Os demais campos são opcionais."
      titleId="create-agency-title"
      descriptionId="create-agency-description"
      onClose={onClose}
      onSubmit={handleSubmit((values) => onSave(values))}
      isSubmitting={isSubmitting}
    >
      <TextField
        {...register('name')}
        id="create-agency-name"
        label="Nome"
        placeholder="Jovens com uma Missão"
        required
        fullWidth
        autoComplete="organization"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />

      <Controller
        name="zipCode"
        control={control}
        render={({ field }) => (
          <CatalogZipField
            id="create-agency-zip"
            value={field.value}
            onChange={(value) => field.onChange(maskCep(value))}
            onBlur={field.onBlur}
            onSearch={search}
            status={status}
            error={Boolean(errors.zipCode)}
            helperText={errors.zipCode?.message ?? message}
          />
        )}
      />

      <TextField
        {...register('address1')}
        id="create-agency-address1"
        label="Endereço"
        placeholder="Av. Sete de Setembro, 200"
        fullWidth
        autoComplete="address-line1"
      />
      <TextField
        {...register('address2')}
        id="create-agency-address2"
        label="Complemento"
        placeholder="Sala 12"
        fullWidth
        autoComplete="address-line2"
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('city')}
          id="create-agency-city"
          label="Cidade"
          placeholder="Curitiba"
          required
          fullWidth
          autoComplete="address-level2"
          error={Boolean(errors.city)}
          helperText={errors.city?.message}
        />
        <TextField
          {...register('state')}
          id="create-agency-state"
          label="Estado"
          placeholder="PR"
          required
          fullWidth
          autoComplete="address-level1"
          error={Boolean(errors.state)}
          helperText={errors.state?.message}
        />
      </Stack>

      <TextField
        {...register('country')}
        id="create-agency-country"
        label="País"
        placeholder="Brasil"
        required
        fullWidth
        autoComplete="country-name"
        error={Boolean(errors.country)}
        helperText={errors.country?.message}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="create-agency-phone"
            label="Telefone"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            placeholder="(41) 98765-4321"
            defaultCountry="br"
          />
        )}
      />

      <TextField
        {...register('website')}
        id="create-agency-website"
        label="Website"
        fullWidth
        placeholder="https://agencia.org"
        error={Boolean(errors.website)}
        helperText={errors.website?.message}
      />
    </CatalogCreateDialog>
  );
}
