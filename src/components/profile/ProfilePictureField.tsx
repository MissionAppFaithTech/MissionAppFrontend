'use client';

import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import ProfilePhotoAddButton from '@/components/profile/ProfilePhotoAddButton';
import { useProfilePictureUpload } from '@/hooks/useProfilePictureUpload';
import { PROFILE_PICTURE_ACCEPT } from '@/services/profilePicture.service';

type ProfilePictureFieldProps = {
  /** Photo already saved on the account. */
  currentUrl?: string;
  /** Name for the image's alt text. */
  displayName: string;
};

/**
 * Avatar of the edit forms with upload and removal. The photo is saved as soon
 * as it is picked, independently of the form's "Salvar".
 */
export default function ProfilePictureField({ currentUrl, displayName }: ProfilePictureFieldProps) {
  const { photoUrl, error, busy, status, statusMessage, selectFile, remove } =
    useProfilePictureUpload({ currentUrl });
  const hintId = 'profile-picture-hint';

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
      <Box sx={{ position: 'relative' }} aria-busy={busy || undefined}>
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
            opacity: busy ? 0.6 : 1,
          }}
        >
          <PersonIcon aria-hidden sx={{ fontSize: { xs: 48, sm: 56 } }} />
        </Avatar>
        {busy ? (
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
          disabled={busy}
        >
          <Box
            component="input"
            type="file"
            accept={PROFILE_PICTURE_ACCEPT}
            hidden
            disabled={busy}
            onChange={selectFile}
          />
        </ProfilePhotoAddButton>
      </Box>

      <Typography id={hintId} variant="body2" color="text.secondary">
        JPG, PNG ou WebP de até 5 MB. A foto é salva assim que você a escolhe.
      </Typography>

      <Typography role="status" aria-live="polite" variant="body2" color="text.secondary">
        {statusMessage}
      </Typography>

      {error ? (
        <Typography role="alert" variant="body2" color="error.main">
          {error}
        </Typography>
      ) : null}

      {photoUrl && status !== 'uploading' && status !== 'processing' ? (
        <PillButton
          type="button"
          tone="primarySoftOutline"
          size="small"
          onClick={remove}
          loading={status === 'removing'}
          sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
        >
          Remover foto
        </PillButton>
      ) : null}
    </Stack>
  );
}
