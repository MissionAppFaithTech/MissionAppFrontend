'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PersonIcon from '@mui/icons-material/Person';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import StyledTextArea from '@/components/common/StyledTextArea';
import PublicContactFields from '@/components/profile/PublicContactFields';
import UsernameAvailabilityField from '@/components/profile/UsernameAvailabilityField';
import type { UsernameAvailabilityStatus } from '@/hooks/useUsernameAvailability';
import { ApiError } from '@/lib/api/client';
import {
  BIO_MAX_LENGTH,
  phoneDigits,
  profileEditSchema,
  type ProfileEditFormData,
} from '@/schemas/profile.schema';
import type { UpdateHeaderPayload, UpdatePublicContactsPayload } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useProfileStore } from '@/stores/profileStore';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ProfileData } from '@/types/profile';

type ProfileEditFormProps = {
  profile: ProfileData;
};

const BACK_HREF = '/profile/sobre';

/** Backend field → form field, for errors returned by the API. */
const API_FIELD_TO_FORM: Record<string, FieldPath<ProfileEditFormData>> = {
  fullName: 'displayName',
  username: 'username',
  biography: 'bio',
  publicEmail: 'publicEmail',
  publicPhone: 'publicPhone',
};

function toFormValues(profile: ProfileData): ProfileEditFormData {
  return {
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.roleDescription,
    publicEmail: profile.contact?.publicEmail ?? '',
    publicPhone: profile.contact?.publicPhone ?? '',
  };
}

/** A bare country code (what the phone input emits when empty) counts as no phone. */
function normalizePhone(value: string): string {
  return phoneDigits(value).length <= 3 ? '' : value;
}

/** Only changed fields are sent; emptied text is sent as `null` to clear it on the backend. */
export function buildPayloads(
  data: ProfileEditFormData,
  initial: ProfileEditFormData,
  dirty: Partial<Record<keyof ProfileEditFormData, boolean>>
) {
  const header: UpdateHeaderPayload = {};
  const contacts: UpdatePublicContactsPayload = {};

  if (dirty.displayName && data.displayName !== initial.displayName.trim()) {
    header.fullName = data.displayName;
  }
  if (dirty.username && data.username !== initial.username) header.username = data.username;
  if (dirty.bio && data.bio !== initial.bio.trim()) header.biography = data.bio || null;
  if (dirty.publicEmail && data.publicEmail !== initial.publicEmail.trim()) {
    contacts.publicEmail = data.publicEmail || null;
  }
  const phone = normalizePhone(data.publicPhone);
  if (phone !== normalizePhone(initial.publicPhone)) contacts.publicPhone = phone || null;

  return { header, contacts };
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const saveHeader = useProfileStore((s) => s.saveHeader);
  const notify = useFeedbackStore((s) => s.notify);
  const [usernameStatus, setUsernameStatus] = useState<UsernameAvailabilityStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onTouched',
    values: toFormValues(profile),
    resetOptions: { keepDirtyValues: true },
  });

  // MUI forwards `ref` to the root div; the input needs it so errors can focus it.
  const { ref: displayNameRef, ...displayNameField } = register('displayName');

  const onSubmit = async (data: ProfileEditFormData) => {
    setSubmitError(null);

    if (usernameStatus === 'taken') {
      setError(
        'username',
        { type: 'validate', message: 'Este nome de usuário já está em uso' },
        { shouldFocus: true }
      );
      return;
    }

    const { header, contacts } = buildPayloads(data, toFormValues(profile), dirtyFields);
    if (Object.keys(header).length === 0 && Object.keys(contacts).length === 0) {
      notify('Nenhuma alteração para salvar.', 'info');
      router.push(BACK_HREF);
      return;
    }

    try {
      await saveHeader({ header, contacts });
      notify('Perfil atualizado com sucesso.');
      router.push(BACK_HREF);
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
      let focused = false;
      for (const [apiField, message] of Object.entries(fieldErrors)) {
        const formField = API_FIELD_TO_FORM[apiField];
        if (!formField) continue;
        setError(formField, { type: 'server', message }, { shouldFocus: !focused });
        focused = true;
      }
      if (!focused) {
        setSubmitError(
          error instanceof Error ? error.message : 'Não foi possível salvar o perfil.'
        );
      }
    }
  };

  return (
    <Card
      component="section"
      aria-labelledby="profile-edit-title"
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
              id="profile-edit-title"
              component="h1"
              variant="h6"
              color="primary.main"
              sx={{ fontWeight: 700 }}
            >
              Editar perfil
            </Typography>

            {submitError ? (
              <Alert severity="error" role="alert">
                {submitError}
              </Alert>
            ) : null}

            <Stack spacing={1} sx={{ alignItems: 'center' }}>
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
                <PersonIcon aria-hidden sx={{ fontSize: { xs: 48, sm: 56 } }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Envio de foto de perfil em breve.
              </Typography>
            </Stack>

            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <Typography
                component="h2"
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
                  Nome completo:
                </Typography>
                <TextField
                  id="displayName"
                  {...displayNameField}
                  inputRef={displayNameRef}
                  size="small"
                  fullWidth
                  autoComplete="name"
                  error={Boolean(errors.displayName)}
                  helperText={errors.displayName?.message}
                  slotProps={{
                    htmlInput: {
                      maxLength: 255,
                      'aria-invalid': Boolean(errors.displayName) || undefined,
                      'aria-describedby': errors.displayName
                        ? 'displayName-helper-text'
                        : undefined,
                    },
                    formHelperText: { id: 'displayName-helper-text' },
                  }}
                />
              </Stack>

              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <UsernameAvailabilityField
                    id="username"
                    inputRef={field.ref}
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
                    inputRef={field.ref}
                    label="Minibiografia"
                    value={field.value}
                    onChange={field.onChange}
                    minRows={2}
                    maxLength={BIO_MAX_LENGTH}
                    placeholder="Conte em poucas palavras sua atuação ou chamado missionário"
                    error={Boolean(errors.bio)}
                    helperText={errors.bio?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            <PublicContactFields
              control={control}
              errors={errors}
              visibilityToggles={false}
              accountContact={{
                email: profile.contact?.accountEmail,
                phone: profile.contact?.accountPhone,
              }}
            />

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              sx={{
                justifyContent: 'flex-end',
                pt: { xs: 1, sm: 2 },
                '& .MuiButton-root': {
                  ...FORM_ACTION_BUTTON_SX,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                },
              }}
            >
              <PillButton
                href={BACK_HREF}
                tone="primarySoftOutline"
                size="medium"
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
  );
}
