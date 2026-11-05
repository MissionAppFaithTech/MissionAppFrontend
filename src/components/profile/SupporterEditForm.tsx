'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import EditBackButton from '@/components/profile/EditBackButton';
import ProfilePictureField from '@/components/profile/ProfilePictureField';
import PublicContactFields from '@/components/profile/PublicContactFields';
import UsernameAvailabilityField from '@/components/profile/UsernameAvailabilityField';
import StyledTextArea from '@/components/common/StyledTextArea';
import { useProfilePictureDraft } from '@/hooks/useProfilePictureDraft';
import type { UsernameAvailabilityStatus } from '@/hooks/useUsernameAvailability';
import { ApiError } from '@/lib/api/client';
import { profileLocations } from '@/lib/profileOptions';
import {
  samePhone,
  supporterEditSchema,
  type SupporterEditFormData,
} from '@/schemas/profile.schema';
import { profileSaveFeedback, saveProfileEdits } from '@/services/profileSave.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ProfileData } from '@/types/profile';

type SupporterEditFormProps = {
  profile: ProfileData;
};

const BACK_HREF = '/profile/supporter/missionarios';

function toFormValues(profile: ProfileData): SupporterEditFormData {
  return {
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
  };
}

export default function SupporterEditForm({ profile }: SupporterEditFormProps) {
  const router = useRouter();
  const notify = useFeedbackStore((s) => s.notify);
  const [usernameStatus, setUsernameStatus] = useState<UsernameAvailabilityStatus>('idle');
  const [processing, setProcessing] = useState(false);
  const picture = useProfilePictureDraft(profile.avatarUrl);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, defaultValues },
  } = useForm<SupporterEditFormData>({
    resolver: zodResolver(supporterEditSchema),
    mode: 'onTouched',
    defaultValues: toFormValues(profile),
  });

  // Compared with the last saved values: the phone input reformats its value on
  // mount, so react-hook-form's `isDirty` would flag an untouched form.
  const watched = useWatch({ control });
  const baseline = { ...toFormValues(profile), ...defaultValues };
  const fieldsDirty = (Object.keys(baseline) as (keyof SupporterEditFormData)[]).some((key) =>
    key === 'publicPhone'
      ? !samePhone(watched.publicPhone, baseline.publicPhone)
      : watched[key] !== baseline[key]
  );
  const dirty = fieldsDirty || picture.dirty;

  const onSubmit = async (data: SupporterEditFormData) => {
    if (usernameStatus === 'taken' || usernameStatus === 'checking') {
      if (usernameStatus === 'taken') {
        setError('username', {
          type: 'validate',
          message: 'Este nome de usuário já está em uso',
        });
      }
      return;
    }
    if (!dirty) {
      notify('Nenhuma alteração para salvar.', 'info');
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('draft_supporter_header_bio');
      } catch {
        // Ignore
      }
    }

    // NOTE: the supporter's fields are not sent to the API yet (example data);
    // the photo is saved on the account.
    try {
      const result = await saveProfileEdits({
        picture: picture.change,
        hadPicture: Boolean(profile.avatarUrl),
        onProcessing: () => setProcessing(true),
      });
      const feedback = profileSaveFeedback({
        fieldsSaved: fieldsDirty,
        picture: result.picture,
        fieldsMessage: 'Perfil de apoiador atualizado com sucesso!',
      });
      notify(feedback.message, feedback.severity);
      reset(data);
      picture.reset();
      router.refresh();
    } catch (error) {
      notify(
        error instanceof ApiError ? error.message : 'Não foi possível salvar o perfil.',
        'error'
      );
    } finally {
      setProcessing(false);
    }
  };

  /** Drops every unsaved change (fields and photo) and stays on the page. */
  const discardChanges = () => {
    reset(toFormValues(profile));
    picture.reset();
    notify('Alterações descartadas.', 'info');
  };

  const handleCancel = () => {
    if (!dirty) {
      notify('Nenhuma alteração para descartar.', 'info');
      return;
    }
    discardChanges();
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex' }}>
        <EditBackButton
          href={BACK_HREF}
          dirty={dirty}
          onDiscard={discardChanges}
          disabled={isSubmitting}
        />
      </Box>
      <Card
        component="section"
        aria-labelledby="supporter-edit-title"
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
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-busy={isSubmitting || undefined}
          >
            <Stack spacing={{ xs: 3, sm: 4 }}>
              <Typography
                id="supporter-edit-title"
                component="h1"
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                Editar perfil de apoiador
              </Typography>

              <ProfilePictureField
                picture={picture}
                displayName={profile.displayName}
                disabled={isSubmitting}
                processing={processing}
              />

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
                spacing={1.5}
                useFlexGap
                sx={{
                  justifyContent: 'flex-end',
                  pt: { xs: 2, sm: 3, md: 4 },
                  '& .MuiButton-root': {
                    ...FORM_ACTION_BUTTON_SX,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: 'center',
                  },
                }}
              >
                <Box sx={{ mr: { sm: 'auto' }, display: 'flex' }}>
                  <EditBackButton
                    href={BACK_HREF}
                    dirty={dirty}
                    onDiscard={discardChanges}
                    disabled={isSubmitting}
                  />
                </Box>
                <PillButton
                  type="button"
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </PillButton>
                <PillButton
                  type="submit"
                  tone="primaryFilled"
                  size="medium"
                  loading={isSubmitting}
                  loadingPosition="center"
                >
                  Salvar
                </PillButton>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
