'use client';

import { Controller, useForm } from 'react-hook-form';
import {
  TextField,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PhoneField, { isValidInternationalPhone } from '@/components/common/PhoneField';
import { isValidBirthDate, maskBirthDate } from '@/lib/masks';
import type { SupportersStep1Values } from '../types';
import { useSupporterRegisterWizard } from '@/components/register/supporters/SupporterRegisterWizardContext';
import { SELECT_OTHER, faithCommunities } from '@/forms/register/options';

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

export default function SupportersStep1() {
  const { formData, completeStep1 } = useSupporterRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SupportersStep1Values>({
    defaultValues: {
      fullName: '',
      birthDate: '',
      gender: '',
      phone: '',
      faithCommunity: '',
      communityPhone: '',
      pastorName: '',
      pastorPhone: '',
      ...formData,
    },
  });

  const faithCommunity = watch('faithCommunity');
  const showCommunityDetails = faithCommunity === SELECT_OTHER;

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(completeStep1)}
      sx={{ width: '100%' }}
    >
      <Typography variant="body1">Dados pessoais</Typography>

      <TextField
        {...register('fullName', { required: 'Informe seu nome completo' })}
        label="Nome completo"
        fullWidth
        placeholder="Maria da Silva"
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />

      <Controller
        name="birthDate"
        control={control}
        rules={{
          required: 'Informe sua data de nascimento',
          validate: (value) => isValidBirthDate(value) || 'Use o formato DD/MM/AAAA',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Data de nascimento"
            fullWidth
            placeholder="DD/MM/AAAA"
            slotProps={{
              htmlInput: { inputMode: 'numeric', maxLength: 10 },
            }}
            error={Boolean(errors.birthDate)}
            helperText={errors.birthDate?.message}
            onChange={(event) => field.onChange(maskBirthDate(event.target.value))}
          />
        )}
      />

      <Controller
        name="gender"
        control={control}
        rules={{ required: 'Selecione o gênero' }}
        render={({ field }) => (
          <FormControl error={Boolean(errors.gender)} component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ typography: 'body2', color: 'text.primary', mb: 0.5 }}
            >
              Gênero
            </FormLabel>
            <RadioGroup row {...field} value={field.value}>
              <FormControlLabel value="feminino" control={<Radio />} label="Feminino" />
              <FormControlLabel value="masculino" control={<Radio />} label="Masculino" />
            </RadioGroup>
            {errors.gender ? <FormHelperText>{errors.gender.message}</FormHelperText> : null}
          </FormControl>
        )}
      />

      <Controller
        name="phone"
        control={control}
        rules={{
          validate: (value) => {
            if (!value.replace(/\D/g, '')) return 'Informe seu telefone';
            return isValidInternationalPhone(value) || 'Informe um telefone válido';
          },
        }}
        render={({ field }) => (
          <PhoneField
            value={field.value}
            onChange={field.onChange}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            placeholder="(11) 98765-4321"
            defaultCountry="br"
          />
        )}
      />

      <Controller
        name="faithCommunity"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel shrink>Comunidade de fé (opcional)</InputLabel>
            <Select {...field} label="Comunidade de fé (opcional)" displayEmpty>
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {faithCommunities.map((community) => (
                <MenuItem key={community.value} value={community.value}>
                  {community.label}
                </MenuItem>
              ))}
              <MenuItem value={SELECT_OTHER}>Não encontrei na lista</MenuItem>
            </Select>
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

      <Button type="submit" variant="contained" color="primary">
        Continuar
      </Button>
    </Stack>
  );
}
