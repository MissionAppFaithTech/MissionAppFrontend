'use client';

import { useId, useState } from 'react';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PhotoLightbox from '@/components/common/PhotoLightbox';
import PillButton from '@/components/common/PillButton';
import ProfilePictureDialog from '@/components/profile/ProfilePictureDialog';
import type { ProfilePictureChangeState } from '@/hooks/useProfilePictureChange';
import { PROFILE_PICTURE_ACCEPT } from '@/services/profilePicture.service';
import { focusVisibleSx } from '@/theme/theme';

type ProfilePictureFieldProps = {
  /** Photo state of the form (`useProfilePictureChange`). */
  picture: ProfilePictureChangeState;
  /** Name for the image's alt text. */
  displayName: string;
  /** The form is being saved. */
  disabled?: boolean;
};

/** Full-width touch targets of at least 44px, centered label. */
const ACTION_SX = { width: '100%', minHeight: 44, justifyContent: 'center' } as const;

/**
 * Avatar of the edit forms. The photo does not wait for the form's "Salvar":
 * a chosen photo is confirmed in a dialog and saved right away, and removing
 * it asks first.
 */
export default function ProfilePictureField({
  picture,
  displayName,
  disabled = false,
}: ProfilePictureFieldProps) {
  const { photoUrl, removal } = picture;
  const hintId = useId();
  const [viewing, setViewing] = useState(false);
  const locked = disabled || picture.busy;
  const removalFailed = removal === 'failed';

  const avatar = (
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
      }}
    >
      <PersonIcon aria-hidden sx={{ fontSize: { xs: 48, sm: 56 } }} />
    </Avatar>
  );

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
      {photoUrl ? (
        <ButtonBase
          aria-label={`Ampliar foto de perfil de ${displayName}`}
          aria-haspopup="dialog"
          onClick={() => setViewing(true)}
          sx={(theme) => ({
            borderRadius: '50%',
            cursor: 'zoom-in',
            ...focusVisibleSx(theme),
          })}
        >
          {avatar}
        </ButtonBase>
      ) : (
        avatar
      )}

      {/* Same width, stacked: the main action above "Remover foto". */}
      <Stack spacing={1} sx={{ width: { xs: '100%', sm: 240 }, maxWidth: '100%' }}>
        <PillButton
          component="label"
          tone="primaryFilled"
          size="medium"
          startIcon={<PhotoCameraOutlinedIcon aria-hidden />}
          aria-label={photoUrl ? 'Editar foto de perfil' : 'Adicionar foto de perfil'}
          aria-describedby={hintId}
          disabled={locked}
          sx={ACTION_SX}
        >
          {photoUrl ? 'Editar foto' : 'Adicionar foto'}
          <Box
            component="input"
            type="file"
            accept={PROFILE_PICTURE_ACCEPT}
            hidden
            disabled={locked}
            onChange={picture.select}
          />
        </PillButton>
        {photoUrl ? (
          <PillButton
            type="button"
            tone="primarySoftOutline"
            size="medium"
            startIcon={<DeleteOutlinedIcon aria-hidden />}
            onClick={picture.askRemoval}
            disabled={locked}
            sx={ACTION_SX}
          >
            Remover foto
          </PillButton>
        ) : null}
      </Stack>

      <Typography id={hintId} variant="body2" color="text.secondary">
        Use uma foto em JPG, PNG ou WebP. A foto é salva assim que você confirma.
      </Typography>

      <ProfilePictureDialog
        dialog={picture.dialog}
        previewUrl={picture.previewUrl}
        hadPicture={picture.hadPicture}
        onConfirm={picture.send}
        onRetry={picture.send}
        onSelect={picture.select}
        onClose={picture.close}
      />

      <ConfirmDialog
        open={removal !== 'closed'}
        title="Remover sua foto de perfil?"
        description={
          removalFailed ? (
            <span role="alert">
              Não foi possível remover a foto. Tente novamente. Sua foto atual não foi alterada.
            </span>
          ) : (
            'Seu perfil vai ficar sem foto até você adicionar outra.'
          )
        }
        cancelLabel="Manter foto"
        confirmLabel={removalFailed ? 'Tentar novamente' : 'Remover foto'}
        confirmTone="danger"
        loading={removal === 'removing'}
        onCancel={picture.cancelRemoval}
        onConfirm={picture.confirmRemoval}
      />

      {photoUrl ? (
        <PhotoLightbox
          slides={[{ src: photoUrl, alt: `Foto de perfil de ${displayName}` }]}
          index={viewing ? 0 : null}
          onClose={() => setViewing(false)}
        />
      ) : null}
    </Stack>
  );
}
