'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PhoneField from '@/components/common/PhoneField';
import CatalogCreateDialog from '@/forms/register/shared/CatalogCreateDialog';
import CatalogZipField from '@/forms/register/shared/CatalogZipField';
import { applyCatalogFieldErrors } from '@/forms/register/shared/catalogFormErrors';
import { EMPTY_FAITH_COMMUNITY } from '@/forms/register/options';
import { applyCepAddress, useCepAutofill } from '@/hooks/useCepAutofill';
import { maskCep } from '@/lib/masks';
import { validateOnSubmit } from '@/lib/formValidation';
import {
  createFaithCommunitySchema,
  type CreateFaithCommunityFormData,
} from '@/schemas/catalog-create.schema';
import type { FaithCommunityData } from '@/types/account';

type CreateFaithCommunityModalProps = {
  open: boolean;
  initialValues?: Partial<FaithCommunityData>;
  onClose: () => void;
  /**
   * Called with valid data. May create the item right away (Server Action):
   * a rejection keeps the modal open with the API's errors on the fields.
   */
  onSave: (data: CreateFaithCommunityFormData) => void | Promise<void>;
};

export default function CreateFaithCommunityModal({
  open,
  initialValues,
  onClose,
  onSave,
}: CreateFaithCommunityModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateFaithCommunityFormData>({
    resolver: zodResolver(createFaithCommunitySchema),
    ...validateOnSubmit,
    defaultValues: { ...EMPTY_FAITH_COMMUNITY, ...initialValues },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const zipCode = watch('zipCode');
  const { status, message, search } = useCepAutofill({
    zipCode,
    enabled: open,
    onAddress: (address) => applyCepAddress(setValue, address),
  });

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset({ ...EMPTY_FAITH_COMMUNITY, ...initialValues });
    }
    // NOTE: só reidrata ao abrir — senão o reset apaga o que a pessoa está digitando
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValues é um snapshot da abertura
  }, [open, reset]);

  return (
    <CatalogCreateDialog
      open={open}
      title="Cadastrar comunidade de fé"
      description="Cadastre uma nova comunidade de fé."
      titleId="create-church-title"
      descriptionId="create-church-description"
      onClose={onClose}
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        try {
          await onSave(values);
        } catch (error) {
          setSubmitError(applyCatalogFieldErrors(error, setError, 'churchPhone'));
        }
      })}
      errorMessage={submitError}
      isSubmitting={isSubmitting}
    >
      <TextField
        {...register('name')}
        id="create-church-name"
        label="Nome"
        placeholder="Igreja Batista do Centro"
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
            id="create-church-zip"
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
        id="create-church-address1"
        label="Endereço"
        placeholder="Rua das Palmeiras, 100"
        fullWidth
        autoComplete="address-line1"
      />
      <TextField
        {...register('address2')}
        id="create-church-address2"
        label="Complemento"
        placeholder="Sala 2, fundos"
        fullWidth
        autoComplete="address-line2"
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('city')}
          id="create-church-city"
          label="Cidade"
          placeholder="Niterói"
          required
          fullWidth
          autoComplete="address-level2"
          error={Boolean(errors.city)}
          helperText={errors.city?.message}
        />
        <TextField
          {...register('state')}
          id="create-church-state"
          label="Estado"
          placeholder="RJ"
          required
          fullWidth
          autoComplete="address-level1"
          error={Boolean(errors.state)}
          helperText={errors.state?.message}
        />
      </Stack>

      <TextField
        {...register('country')}
        id="create-church-country"
        label="País"
        placeholder="Brasil"
        required
        fullWidth
        autoComplete="country-name"
        error={Boolean(errors.country)}
        helperText={errors.country?.message}
      />

      <Controller
        name="churchPhone"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="create-church-phone"
            label="Telefone da igreja"
            required
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.churchPhone)}
            helperText={errors.churchPhone?.message}
            placeholder="(21) 3456-7890"
            defaultCountry="br"
          />
        )}
      />
      <TextField
        {...register('website')}
        id="create-church-website"
        label="Website"
        fullWidth
        placeholder="https://suaigreja.org.br"
        error={Boolean(errors.website)}
        helperText={errors.website?.message}
      />

      <TextField
        {...register('pastorName')}
        id="create-church-pastor-name"
        label="Nome do pastor"
        placeholder="Pr. Ana Souza"
        required
        fullWidth
        autoComplete="name"
        error={Boolean(errors.pastorName)}
        helperText={errors.pastorName?.message}
      />

      <Controller
        name="pastorPhone"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="create-church-pastor-phone"
            label="Telefone do pastor"
            required
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.pastorPhone)}
            helperText={errors.pastorPhone?.message}
            placeholder="(21) 98765-4321"
            defaultCountry="br"
          />
        )}
      />
    </CatalogCreateDialog>
  );
}
