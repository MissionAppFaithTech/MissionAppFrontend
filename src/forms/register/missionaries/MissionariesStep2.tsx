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

const missionaryAgencies = [
  { value: '1', label: 'Agência missionária 1' },
  { value: '2', label: 'Agência missionária 2' },
  { value: '3', label: 'Agência missionária 3' },
];

const faithCommunities = [
  { value: '1', label: 'Comunidade de fé 1' },
  { value: '2', label: 'Comunidade de fé 2' },
  { value: '3', label: 'Comunidade de fé 3' },
];

function phoneRules(message: string) {
  return {
    validate: (value: string) => {
      if (!value.replace(/\D/g, '')) return message;
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
    formState: { errors },
  } = useForm<MissionariesStep2Values>({
    defaultValues: {
      missionaryAgency: '',
      agencyPhone: '',
      missionDescription: '',
      faithCommunity: '',
      communityPhone: '',
      pastorName: '',
      pastorPhone: '',
      ...formData,
    },
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(completeStep2)} sx={{ width: '100%' }}>
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
            </Select>
            {errors.missionaryAgency ? (
              <FormHelperText>{errors.missionaryAgency.message}</FormHelperText>
            ) : null}
          </FormControl>
        )}
      />

      <Controller
        name="agencyPhone"
        control={control}
        rules={phoneRules('Informe o telefone da agência missionária')}
        render={({ field }) => (
          <PhoneField
            label="Telefone da agência missionária"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.agencyPhone)}
            helperText={errors.agencyPhone?.message}
            defaultCountry="br"
          />
        )}
      />

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
            <InputLabel shrink>Comunidade de fé</InputLabel>
            <Select {...field} label="Comunidade de fé" displayEmpty>
              <MenuItem value="" disabled>
                Selecione...
              </MenuItem>
              {faithCommunities.map((community) => (
                <MenuItem key={community.value} value={community.value}>
                  {community.label}
                </MenuItem>
              ))}
            </Select>
            {errors.faithCommunity ? (
              <FormHelperText>{errors.faithCommunity.message}</FormHelperText>
            ) : null}
          </FormControl>
        )}
      />

      <Controller
        name="communityPhone"
        control={control}
        rules={phoneRules('Informe o telefone da comunidade de fé')}
        render={({ field }) => (
          <PhoneField
            label="Telefone da comunidade de fé"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.communityPhone)}
            helperText={errors.communityPhone?.message}
            defaultCountry="br"
          />
        )}
      />

      <TextField
        {...register('pastorName', { required: 'Informe o nome do pastor' })}
        label="Nome do pastor"
        fullWidth
        placeholder="Nome do pastor"
        error={Boolean(errors.pastorName)}
        helperText={errors.pastorName?.message}
      />

      <Controller
        name="pastorPhone"
        control={control}
        rules={phoneRules('Informe o telefone do pastor')}
        render={({ field }) => (
          <PhoneField
            label="Telefone do pastor"
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.pastorPhone)}
            helperText={errors.pastorPhone?.message}
            defaultCountry="br"
          />
        )}
      />

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
