'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhoneField from '@/components/common/PhoneField';
import CatalogCreateDialog from '@/forms/register/shared/CatalogCreateDialog';
import { EMPTY_FAITH_COMMUNITY } from '@/forms/register/options';
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
  onSave: (data: CreateFaithCommunityFormData) => void;
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
    formState: { errors, isSubmitting },
  } = useForm<CreateFaithCommunityFormData>({
    resolver: zodResolver(createFaithCommunitySchema),
    ...validateOnSubmit,
    defaultValues: { ...EMPTY_FAITH_COMMUNITY, ...initialValues },
  });

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_FAITH_COMMUNITY, ...initialValues });
    }
    // NOTE: só reidrata ao abrir — senão o reset apaga o que a pessoa está digitando
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValues é um snapshot da abertura
  }, [open, reset]);

  return (
    <CatalogCreateDialog
      open={open}
      title="Cadastrar igreja"
      description="Informe nome, localização, pastor e contatos. Os campos obrigatórios são validados antes de salvar."
      titleId="create-church-title"
      descriptionId="create-church-description"
      onClose={onClose}
      onSubmit={handleSubmit((values) => onSave(values))}
      isSubmitting={isSubmitting}
    >
      <TextField
        {...register('name')}
        id="create-church-name"
        label="Nome"
        required
        fullWidth
        autoComplete="organization"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />

      <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Localização
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('country')}
          id="create-church-country"
          label="País"
          required
          fullWidth
          autoComplete="country-name"
          error={Boolean(errors.country)}
          helperText={errors.country?.message}
        />
        <TextField
          {...register('state')}
          id="create-church-state"
          label="Estado"
          required
          fullWidth
          autoComplete="address-level1"
          error={Boolean(errors.state)}
          helperText={errors.state?.message}
        />
      </Stack>

      <TextField
        {...register('city')}
        id="create-church-city"
        label="Cidade"
        required
        fullWidth
        autoComplete="address-level2"
        error={Boolean(errors.city)}
        helperText={errors.city?.message}
      />

      <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Pastor
      </Typography>

      <TextField
        {...register('pastorName')}
        id="create-church-pastor-name"
        label="Nome do pastor"
        required
        fullWidth
        autoComplete="name"
        error={Boolean(errors.pastorName)}
        helperText={errors.pastorName?.message}
      />

      <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Contatos
      </Typography>

      <Controller
        name="churchPhone"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="create-church-phone"
            label="Telefone da igreja"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.churchPhone)}
            helperText={errors.churchPhone?.message}
            placeholder="(11) 98765-4321"
            defaultCountry="br"
          />
        )}
      />

      <Controller
        name="pastorPhone"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="create-church-pastor-phone"
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

      <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Dados opcionais
      </Typography>

      <TextField
        {...register('address1')}
        id="create-church-address1"
        label="Endereço"
        fullWidth
        autoComplete="address-line1"
      />
      <TextField
        {...register('address2')}
        id="create-church-address2"
        label="Complemento"
        fullWidth
        autoComplete="address-line2"
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('zipCode')}
          id="create-church-zip"
          label="CEP ou código postal"
          fullWidth
          autoComplete="postal-code"
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
      </Stack>
    </CatalogCreateDialog>
  );
}
