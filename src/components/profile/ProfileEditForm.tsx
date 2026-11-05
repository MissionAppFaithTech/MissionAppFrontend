'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import StyledTextArea from '@/components/common/StyledTextArea';
import EditBackButton from '@/components/profile/EditBackButton';
import ProfilePictureField from '@/components/profile/ProfilePictureField';
import PublicContactFields from '@/components/profile/PublicContactFields';
import UsernameAvailabilityField from '@/components/profile/UsernameAvailabilityField';
import { useProfilePictureDraft } from '@/hooks/useProfilePictureDraft';
import type { UsernameAvailabilityStatus } from '@/hooks/useUsernameAvailability';
import { ApiError } from '@/lib/api/client';
import {
  BIO_MAX_LENGTH,
  phoneDigits,
  profileEditSchema,
  type ProfileEditFormData,
} from '@/schemas/profile.schema';
import type { UpdateHeaderPayload, UpdatePublicContactsPayload } from '@/services/profile.service';
import { profileSaveFeedback, saveProfileEdits } from '@/services/profileSave.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
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
    allowWhatsappContact: profile.contact?.allowWhatsappContact === true,
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
  // Without a phone there is nothing to open in WhatsApp.
  const whatsapp = Boolean(phone) && data.allowWhatsappContact;
  const initialWhatsapp =
    Boolean(normalizePhone(initial.publicPhone)) && initial.allowWhatsappContact;
  if (whatsapp !== initialWhatsapp) contacts.publicPhoneIsWhatsapp = whatsapp;

  return { header, contacts };
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const notify = useFeedbackStore((s) => s.notify);
  const [usernameStatus, setUsernameStatus] = useState<UsernameAvailabilityStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const picture = useProfilePictureDraft(profile.avatarUrl);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, dirtyFields, defaultValues },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onTouched',
    values: toFormValues(profile),
    resetOptions: { keepDirtyValues: true },
  });

  // Compared with the last saved values: the phone input reformats its value on
  // mount, so react-hook-form's `isDirty` would flag an untouched form.
  const watched = useWatch({ control });
  const baseline = { ...toFormValues(profile), ...defaultValues } as ProfileEditFormData;
  const pending = buildPayloads(
    { ...baseline, ...watched } as ProfileEditFormData,
    baseline,
    dirtyFields
  );
  const fieldsDirty =
    Object.keys(pending.header).length > 0 || Object.keys(pending.contacts).length > 0;
  const dirty = fieldsDirty || picture.dirty;

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
    const fieldsChanged = Object.keys(header).length > 0 || Object.keys(contacts).length > 0;
    if (!fieldsChanged && !picture.change) {
      notify('Nenhuma alteração para salvar.', 'info');
      return;
    }

    try {
      const result = await saveProfileEdits({
        header,
        contacts,
        picture: picture.change,
        hadPicture: Boolean(profile.avatarUrl),
        onProcessing: () => setProcessing(true),
      });
      const feedback = profileSaveFeedback({ fieldsSaved: fieldsChanged, picture: result.picture });
      notify(feedback.message, feedback.severity);
      // Stays on the page with the saved values; the refresh brings the server's
      // data (new photo URL) to this form and to the profile header (ADR-0005).
      reset(data, { keepDirtyValues: false });
      picture.reset();
      router.refresh();
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
        const message =
          error instanceof Error ? error.message : 'Não foi possível salvar o perfil.';
        setSubmitError(message);
        notify(message, 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  /** Drops every unsaved change (fields and photo) and stays on the page. */
  const discardChanges = () => {
    reset(toFormValues(profile), { keepDirtyValues: false });
    picture.reset();
    setSubmitError(null);
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

              <ProfilePictureField
                picture={picture}
                displayName={profile.displayName}
                disabled={isSubmitting}
                processing={processing}
              />

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
                whatsappToggle
                accountContact={{
                  email: profile.contact?.accountEmail,
                  phone: profile.contact?.accountPhone,
                }}
              />

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1.5}
                useFlexGap
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
