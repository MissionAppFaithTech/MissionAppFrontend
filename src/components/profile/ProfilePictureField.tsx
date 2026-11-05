'use client';

import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import ProfilePhotoAddButton from '@/components/profile/ProfilePhotoAddButton';
import type { ProfilePictureDraftState } from '@/hooks/useProfilePictureDraft';
import { PROFILE_PICTURE_ACCEPT } from '@/services/profilePicture.service';

type ProfilePictureFieldProps = {
  /** Staged photo of the form (`useProfilePictureDraft`). */
  picture: ProfilePictureDraftState;
  /** Name for the image's alt text. */
  displayName: string;
  /** The form is being saved. */
  disabled?: boolean;
  /** The saved photo is being compressed by the backend. */
  processing?: boolean;
};

function statusMessage({ draft }: ProfilePictureDraftState, processing: boolean) {
  if (processing) return 'Processando a foto de perfil...';
  if (draft.kind === 'replace')
    return 'Nova foto selecionada. Ela será salva quando você clicar em Salvar.';
  if (draft.kind === 'remove') return 'A foto será removida quando você clicar em Salvar.';
  return '';
}

/**
 * Avatar of the edit forms. Choosing or removing a photo only stages the
 * change: it is applied with the form's "Salvar" and undone by "Cancelar".
 */
export default function ProfilePictureField({
  picture,
  displayName,
  disabled = false,
  processing = false,
}: ProfilePictureFieldProps) {
  const { photoUrl, error } = picture;
  const hintId = 'profile-picture-hint';

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
      <Box sx={{ position: 'relative' }} aria-busy={processing || undefined}>
        <Avatar
          src={photoUrl}
          alt={photoUrl ? `Foto de perfil de ${displayName}` : ''}
          sx={{
            width: { xs: 88, sm: 104 },
            height: { xs: 88, sm: 104 },
            bgcolor: 'avatar.main',
            color: 'avatar.contrastText',
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: 2,
            opacity: processing ? 0.6 : 1,
          }}
        >
          <PersonIcon aria-hidden sx={{ fontSize: { xs: 48, sm: 56 } }} />
        </Avatar>
        {processing ? (
          <CircularProgress
            size={32}
            aria-hidden
            sx={{ position: 'absolute', inset: 0, m: 'auto' }}
          />
        ) : null}
        <ProfilePhotoAddButton
          component="label"
          aria-label={photoUrl ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
          aria-describedby={hintId}
          disabled={disabled}
        >
          <Box
            component="input"
            type="file"
            accept={PROFILE_PICTURE_ACCEPT}
            hidden
            disabled={disabled}
            onChange={picture.select}
          />
        </ProfilePhotoAddButton>
      </Box>

      <Typography id={hintId} variant="body2" color="text.secondary">
        JPG, PNG ou WebP de até 5 MB. A foto é salva quando você clica em Salvar.
      </Typography>

      <Typography role="status" aria-live="polite" variant="body2" color="text.secondary">
        {statusMessage(picture, processing)}
      </Typography>

      {error ? (
        <Typography role="alert" variant="body2" color="error.main">
          {error}
        </Typography>
      ) : null}

      {photoUrl ? (
        <PillButton
          type="button"
          tone="primarySoftOutline"
          size="small"
          onClick={picture.remove}
          disabled={disabled}
          sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
        >
          Remover foto
        </PillButton>
      ) : null}
    </Stack>
  );
}
