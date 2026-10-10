'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PersonIcon from '@mui/icons-material/Person';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
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
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/profile.schema';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ProfileData } from '@/types/profile';

type ProfileEditFormProps = {
  profile: ProfileData;
};

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameAvailabilityStatus>('idle');

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
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
        localStorage.removeItem('draft_profile_header_bio');
      } catch {
        // Ignore
      }
    }
    setToastOpen(true);
  };

  return (
    <>
      <Card
        component="section"
        elevation={0}
        sx={{
          minHeight: { md: 660 },
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
                Editar perfil
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

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="displayName"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Nome:{' '}
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

                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <StyledTextArea
                      id="bio"
                      label="Bio"
                      value={field.value}
                      onChange={field.onChange}
                      minRows={2}
                      placeholder="Descreva sua atuação ou chamado missionário..."
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
                    Local de atuação atual:
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
                <PillButton href="/profile/sobre" tone="primarySoftOutline" size="medium">
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

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'brandFill.main' : 'primary.main'),
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid var(--mui-palette-action2-borderSubtle)'
                : 'none',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? 'var(--app-shadow-overlay)' : 'var(--app-shadow-sm)',
            '& .MuiAlert-icon': {
              color: (theme) => (theme.palette.mode === 'dark' ? 'success.light' : 'common.white'),
            },
          }}
        >
          Perfil atualizado com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}
