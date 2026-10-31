'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import ProfilePhotoAddButton from '@/components/profile/ProfilePhotoAddButton';
import PublicContactFields from '@/components/profile/PublicContactFields';
import UsernameAvailabilityField from '@/components/profile/UsernameAvailabilityField';
import StyledTextArea from '@/components/common/StyledTextArea';
import type { UsernameAvailabilityStatus } from '@/hooks/useUsernameAvailability';
import { profileLocations } from '@/lib/profileOptions';
import { supporterEditSchema, type SupporterEditFormData } from '@/schemas/profile.schema';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ProfileData } from '@/types/profile';

type SupporterEditFormProps = {
  profile: ProfileData;
};

export default function SupporterEditForm({ profile }: SupporterEditFormProps) {
  const notify = useFeedbackStore((s) => s.notify);
  const [usernameStatus, setUsernameStatus] = useState<UsernameAvailabilityStatus>('idle');

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SupporterEditFormData>({
    resolver: zodResolver(supporterEditSchema),
    mode: 'onTouched',
    defaultValues: {
      username: profile.username || '',
      displayName: profile.displayName || '',
      bio: profile.roleDescription || '',
      currentLocation: profile.about.currentLocation || '',
      publicEmail: profile.contact?.publicEmail || '',
      publicPhone: profile.contact?.publicPhone || '',
      showPublicEmail: profile.contact?.showPublicEmail ?? Boolean(profile.contact?.publicEmail),
      showPublicPhone: profile.contact?.showPublicPhone ?? Boolean(profile.contact?.publicPhone),
      allowWhatsappContact:
        profile.contact?.allowWhatsappContact ??
        Boolean(profile.contact?.whatsappNumber || profile.contact?.publicPhone),
    },
  });

  const onSubmit = () => {
    if (usernameStatus === 'taken' || usernameStatus === 'checking') {
      if (usernameStatus === 'taken') {
        setError('username', {
          type: 'validate',
          message: 'Este nome de usuário já está em uso',
        });
      }
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('draft_supporter_header_bio');
      } catch {
        // Ignore
      }
    }
    notify('Perfil de apoiador atualizado com sucesso!');
  };

  return (
    <Card
      component="section"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={{ xs: 3, sm: 4 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              Editar perfil de apoiador
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 88, sm: 104 },
                    height: { xs: 88, sm: 104 },
                    bgcolor: 'avatar.main',
                    color: 'avatar.contrastText',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 48, sm: 56 } }} />
                </Avatar>

                <ProfilePhotoAddButton component="label" aria-label="Alterar foto de perfil">
                  <Box component="input" type="file" accept="image/*" hidden />
                </ProfilePhotoAddButton>
              </Box>
            </Box>

            {/* Seção 1: Informações Gerais */}
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <Typography
                variant="subtitle1"
                color="primary.main"
                sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
              >
                Informações básicas
              </Typography>

              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <UsernameAvailabilityField
                    id="username"
                    value={field.value}
                    onChange={field.onChange}
                    currentUsername={profile.username}
                    errorMessage={errors.username?.message}
                    onStatusChange={setUsernameStatus}
                    onTaken={() =>
                      setError('username', {
                        type: 'validate',
                        message: 'Este nome de usuário já está em uso',
                      })
                    }
                    onAvailable={() => clearErrors('username')}
                  />
                )}
              />

              <Stack spacing={0.75}>
                <Typography
                  component="label"
                  htmlFor="displayName"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Nome completo:
                </Typography>
                <TextField
                  id="displayName"
                  {...register('displayName')}
                  size="small"
                  fullWidth
                  error={Boolean(errors.displayName)}
                  helperText={errors.displayName?.message}
                />
              </Stack>

              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <StyledTextArea
                    id="bio"
                    label="Bio / Papel"
                    value={field.value}
                    onChange={field.onChange}
                    minRows={2}
                    placeholder="Descreva seu papel ou como você apoia missões..."
                    error={Boolean(errors.bio)}
                    helperText={errors.bio?.message}
                  />
                )}
              />

              <Stack spacing={0.75}>
                <Typography
                  component="label"
                  htmlFor="currentLocation"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Localização atual:
                </Typography>
                <Controller
                  name="currentLocation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="currentLocation"
                      select
                      size="small"
                      fullWidth
                      error={Boolean(errors.currentLocation)}
                      helperText={errors.currentLocation?.message}
                    >
                      {profileLocations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </Stack>

            <Divider />

            <PublicContactFields control={control} errors={errors} />

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 1.5 }}
              sx={{
                justifyContent: 'flex-end',
                pt: { xs: 2, sm: 3, md: 4 },
                '& .MuiButton-root': {
                  ...FORM_ACTION_BUTTON_SX,
                  width: { xs: '100%', sm: 'auto' },
                },
              }}
            >
              <PillButton
                href="/profile/supporter/missionarios"
                tone="primarySoftOutline"
                size="medium"
              >
                Voltar
              </PillButton>
              <PillButton type="submit" tone="primaryFilled" size="medium">
                Salvar
              </PillButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
