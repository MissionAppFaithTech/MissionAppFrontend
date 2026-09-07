'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import PillButton from '@/components/common/PillButton';
import PhoneField from '@/components/common/PhoneField';
import { maskBirthDate } from '@/lib/masks';
import { supporterStep1Schema, type SupporterStep1FormData } from '@/schemas/register.schema';
import { useSupporterRegisterWizard } from '@/components/register/supporters/SupporterRegisterWizardContext';
import { SELECT_OTHER, faithCommunities } from '@/forms/register/options';
import { yieldToMain } from '@/lib/scheduler';

export default function SupportersStep1() {
  const { formData, completeStep1 } = useSupporterRegisterWizard();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupporterStep1FormData>({
    resolver: zodResolver(supporterStep1Schema),
    mode: 'onTouched',
    defaultValues: {
      fullName: formData.fullName || '',
      email: formData.email || '',
      birthDate: formData.birthDate || '',
      gender: (formData.gender as 'feminino' | 'masculino') || undefined,
      phone: formData.phone || '',
      faithCommunity: formData.faithCommunity || '',
      communityPhone: formData.communityPhone || '',
      pastorName: formData.pastorName || '',
      pastorPhone: formData.pastorPhone || '',
    },
  });

  const faithCommunity = watch('faithCommunity');
  const showCommunityDetails = faithCommunity === SELECT_OTHER;

  const handleStepSubmit = async (data: SupporterStep1FormData) => {
    await yieldToMain();
    completeStep1(data);
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(handleStepSubmit)}
      sx={{ width: '100%' }}
      noValidate
    >
      <Typography variant="body1">Dados pessoais</Typography>

      <TextField
        {...register('fullName')}
        label="Nome completo"
        fullWidth
        placeholder="Maria da Silva"
        slotProps={{
          htmlInput: { autoComplete: 'name' },
        }}
        error={Boolean(errors.fullName)}
        helperText={errors.fullName?.message}
      />

      <TextField
        {...register('email')}
        label="E-mail"
        type="email"
        fullWidth
        placeholder="seu@email.com"
        slotProps={{
          htmlInput: { autoComplete: 'email', inputMode: 'email' },
        }}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />

      <Controller
        name="birthDate"
        control={control}
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
        render={({ field }) => (
          <FormControl error={Boolean(errors.gender)} component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ typography: 'body2', color: 'text.primary', mb: 0.5 }}
            >
              Gênero
            </FormLabel>
            <RadioGroup row {...field} value={field.value ?? ''}>
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
            <InputLabel id="supporter-faith-community-label" shrink>
              Comunidade de fé (opcional)
            </InputLabel>
            <Select
              {...field}
              labelId="supporter-faith-community-label"
              id="faithCommunity"
              label="Comunidade de fé (opcional)"
              displayEmpty
            >
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
  );
}
