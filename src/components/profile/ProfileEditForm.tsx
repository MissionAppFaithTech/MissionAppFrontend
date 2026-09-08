'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import RichTextEditor from '@/components/common/RichTextEditor';
import { profileLocations } from '@/lib/profileOptions';
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/profile.schema';
import type { ProfileData } from '@/types/profile';

type ProfileEditFormProps = {
  profile: ProfileData;
};

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
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
      whatsappNumber: profile.contact?.whatsappNumber || '',
    },
  });

  const onSubmit = () => {
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

                  <IconButton
                    component="label"
                    aria-label="Alterar foto de perfil"
                    sx={{
                      position: 'absolute',
                      right: { xs: -4, sm: -2 },
                      bottom: { xs: -2, sm: 2 },
                      width: { xs: 44, sm: 40 },
                      height: { xs: 44, sm: 40 },
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'primary.dark', color: 'common.white' },
                    }}
                  >
                    <AddIcon sx={{ fontSize: { xs: 22, sm: 20 } }} />
                    <Box component="input" type="file" accept="image/*" hidden />
                  </IconButton>
                </Box>
              </Box>

              {/* Seção 1: Informações Gerais */}
              <Stack spacing={{ xs: 2.5, sm: 3 }}>
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                >
                  Informações Básicas
                </Typography>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="username"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Nome de usuário:
                  </Typography>
                  <TextField
                    id="username"
                    {...register('username')}
                    size="small"
                    fullWidth
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                  />
                </Stack>

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
                    <RichTextEditor
                      id="bio"
                      label="Bio"
                      value={field.value}
                      onChange={field.onChange}
                      minRows={2}
                      draftKey="profile_header_bio"
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

              {/* Seção 2: Contatos Públicos */}
              <Stack spacing={{ xs: 2.5, sm: 3 }}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                  >
                    Contatos Públicos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Essas informações serão exibidas publicamente para visitantes e apoiadores no
                    modal de contato.
                  </Typography>
                </Box>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="publicEmail"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    E-mail de contato público:
                  </Typography>
                  <TextField
                    id="publicEmail"
                    {...register('publicEmail')}
                    type="email"
                    size="small"
                    fullWidth
                    placeholder="exemplo@dominio.com"
                    error={Boolean(errors.publicEmail)}
                    helperText={errors.publicEmail?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="publicPhone"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Telefone de contato público:
                  </Typography>
                  <TextField
                    id="publicPhone"
                    {...register('publicPhone')}
                    type="tel"
                    size="small"
                    fullWidth
                    placeholder="+55 (21) 98765-4321"
                    error={Boolean(errors.publicPhone)}
                    helperText={errors.publicPhone?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="whatsappNumber"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Número do WhatsApp:
                  </Typography>
                  <TextField
                    id="whatsappNumber"
                    {...register('whatsappNumber')}
                    type="tel"
                    size="small"
                    fullWidth
                    placeholder="+5521987654321"
                    error={Boolean(errors.whatsappNumber)}
                    helperText={
                      errors.whatsappNumber?.message ||
                      'Inclua o DDI e DDD (ex: +5521987654321) para facilitar o link direto'
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <WhatsAppIcon sx={{ fontSize: 20, color: '#25D366' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>
              </Stack>

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 1.5 }}
                sx={{
                  justifyContent: 'flex-end',
                  pt: { xs: 2, sm: 3, md: 4 },
                  '& .MuiButton-root': {
                    minHeight: { xs: 48, sm: 42 },
                    fontSize: { xs: '0.9375rem', sm: '0.875rem' },
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
