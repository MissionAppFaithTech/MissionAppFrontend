'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import PillButton from '@/components/common/PillButton';
import PhoneField from '@/components/common/PhoneField';
import { missionaryStep2Schema, type MissionaryStep2FormData } from '@/schemas/register.schema';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { SELECT_OTHER, faithCommunities, missionaryAgencies } from '@/forms/register/options';
import { yieldToMain } from '@/lib/scheduler';

export default function MissionariesStep2() {
  const { formData, completeStep2, goBack } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MissionaryStep2FormData>({
    resolver: zodResolver(missionaryStep2Schema),
    mode: 'onTouched',
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
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(handleStepSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body1">Dados de missão</Typography>

      <Controller
        name="missionaryAgency"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={Boolean(errors.missionaryAgency)}>
            <InputLabel shrink>Agência missionária</InputLabel>
            <Select {...field} label="Agência missionária" displayEmpty>
              <MenuItem value="" disabled>
                Selecione...
              </MenuItem>
              {missionaryAgencies.map((agency) => (
                <MenuItem key={agency.value} value={agency.value}>
                  {agency.label}
                </MenuItem>
              ))}
              <MenuItem value={SELECT_OTHER}>Não encontrei na lista</MenuItem>
            </Select>
            {errors.missionaryAgency ? (
              <FormHelperText>{errors.missionaryAgency.message}</FormHelperText>
            ) : null}
          </FormControl>
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
          <FormControl fullWidth error={Boolean(errors.faithCommunity)}>
            <InputLabel id="missionary-faith-community-label" shrink>
              Comunidade de fé
            </InputLabel>
            <Select
              {...field}
              labelId="missionary-faith-community-label"
              id="faithCommunity"
              label="Comunidade de fé"
              displayEmpty
            >
              <MenuItem value="" disabled>
                Selecione...
              </MenuItem>
              {faithCommunities.map((community) => (
                <MenuItem key={community.value} value={community.value}>
                  {community.label}
                </MenuItem>
              ))}
              <MenuItem value={SELECT_OTHER}>Não encontrei na lista</MenuItem>
            </Select>
            {errors.faithCommunity ? (
              <FormHelperText>{errors.faithCommunity.message}</FormHelperText>
            ) : null}
          </FormControl>
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

      <Stack direction="row" spacing={2}>
        <PillButton
          type="button"
          tone="primarySoftOutline"
          onClick={goBack}
          fullWidth
          sx={{ minHeight: 48, fontSize: '1rem', fontWeight: 500 }}
        >
          Voltar
        </PillButton>
        <PillButton
          type="submit"
          tone="cta"
          disabled={isSubmitting}
          fullWidth
          sx={{
            minHeight: 48,
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" aria-label="Enviando dados" />
              <span>Continuando...</span>
            </>
          ) : (
            'Continuar'
          )}
        </PillButton>
      </Stack>
    </Stack>
  );
}
