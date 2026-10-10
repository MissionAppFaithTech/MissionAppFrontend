'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PhoneField from '@/components/common/PhoneField';
import CatalogCreateDialog from '@/forms/register/shared/CatalogCreateDialog';
import { EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';
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
    formState: { errors, isSubmitting },
  } = useForm<CreateMissionaryAgencyFormData>({
    resolver: zodResolver(createMissionaryAgencySchema),
    ...validateOnSubmit,
    defaultValues: { ...EMPTY_MISSIONARY_AGENCY, ...initialValues },
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
          id="create-agency-country"
          label="País"
          required
          fullWidth
          autoComplete="country-name"
          error={Boolean(errors.country)}
          helperText={errors.country?.message}
        />
        <TextField
          {...register('state')}
          id="create-agency-state"
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
        id="create-agency-city"
        label="Cidade"
        required
        fullWidth
        autoComplete="address-level2"
        error={Boolean(errors.city)}
        helperText={errors.city?.message}
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
        id="create-agency-address1"
        label="Endereço"
        fullWidth
        autoComplete="address-line1"
      />
      <TextField
        {...register('address2')}
        id="create-agency-address2"
        label="Complemento"
        fullWidth
        autoComplete="address-line2"
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          {...register('zipCode')}
          id="create-agency-zip"
          label="CEP ou código postal"
          fullWidth
          autoComplete="postal-code"
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
      </Stack>
    </CatalogCreateDialog>
  );
}
