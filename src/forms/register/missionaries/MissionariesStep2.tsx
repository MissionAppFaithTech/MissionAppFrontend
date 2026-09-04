'use client';

import { Controller, useForm } from 'react-hook-form';
import {
  TextField,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import PhoneField, { isValidInternationalPhone } from '@/components/common/PhoneField';
import type { MissionariesStep2Values } from '../types';
import { useMissionaryRegisterWizard } from '@/components/register/missionaries/MissionaryRegisterWizardContext';
import { SELECT_OTHER, faithCommunities, missionaryAgencies } from '@/forms/register/options';

function phoneRules(message: string, required: boolean) {
  return {
    validate: (value: string) => {
      if (!value.replace(/\D/g, '')) {
        return required ? message : true;
      }
      return isValidInternationalPhone(value) || 'Informe um telefone válido';
    },
  };
}

export default function MissionariesStep2() {
  const { formData, completeStep2, goBack } = useMissionaryRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MissionariesStep2Values>({
    defaultValues: {
      missionaryAgency: '',
      agencyCustomName: '',
      agencyPhone: '',
      missionDescription: '',
      faithCommunity: '',
      communityPhone: '',
      pastorName: '',
      pastorPhone: '',
      ...formData,
    },
  });

  const missionaryAgency = watch('missionaryAgency');
  const faithCommunity = watch('faithCommunity');
  const showAgencyDetails = missionaryAgency === SELECT_OTHER;
  const showCommunityDetails = faithCommunity === SELECT_OTHER;

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(completeStep2)}
      sx={{ width: '100%' }}
    >
      <Typography variant="body1">Dados de missão</Typography>

      <Controller
        name="missionaryAgency"
        control={control}
        rules={{ required: 'Selecione a agência missionária' }}
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
            {...register('agencyCustomName', {
              required: showAgencyDetails ? 'Informe o nome da agência' : false,
            })}
            label="Nome da agência missionária"
            fullWidth
            placeholder="Nome da sua agência"
            error={Boolean(errors.agencyCustomName)}
            helperText={errors.agencyCustomName?.message}
          />

          <Controller
            name="agencyPhone"
            control={control}
            rules={phoneRules('Informe o telefone da agência missionária', true)}
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
        {...register('missionDescription', {
          required: 'Descreva seu projeto ou atuação missionária',
        })}
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
        rules={{ required: 'Selecione a comunidade de fé' }}
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
            rules={phoneRules('Informe o telefone da comunidade de fé', true)}
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
            {...register('pastorName', {
              required: showCommunityDetails ? 'Informe o nome do pastor' : false,
            })}
            label="Nome do pastor"
            fullWidth
            placeholder="Pr. João Souza"
            error={Boolean(errors.pastorName)}
            helperText={errors.pastorName?.message}
          />

          <Controller
            name="pastorPhone"
            control={control}
            rules={phoneRules('Informe o telefone do pastor', true)}
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
        <Button type="button" variant="outlined" onClick={goBack} fullWidth>
          Voltar
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Continuar
        </Button>
      </Stack>
    </Stack>
  );
}
