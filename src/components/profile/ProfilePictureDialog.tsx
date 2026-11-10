'use client';

import { useId, useState, type ChangeEvent, type ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { PictureDialogView } from '@/hooks/useProfilePictureChange';
import { PROFILE_PICTURE_ACCEPT, type PictureSendStage } from '@/services/profilePicture.service';

type ProfilePictureDialogProps = {
  dialog: PictureDialogView;
  /** Preview of the chosen file. */
  previewUrl?: string;
  /** The account has a photo that a failed send leaves untouched. */
  hadPicture: boolean;
  onConfirm: () => void;
  onRetry: () => void;
  /** Another file was chosen from inside the dialog. */
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
};

const STAGE_TEXT: Record<PictureSendStage, string> = {
  preparing: 'Preparando sua foto...',
  uploading: 'Enviando sua foto...',
  finishing: 'Quase pronto...',
};

const SLOW_TEXT = 'Está demorando um pouco mais que o normal. Não feche esta tela.';

/** Full-width touch targets of at least 44px, centered label. */
const ACTION_SX = { width: '100%', minHeight: 44, justifyContent: 'center' } as const;

const PREVIEW_SIZE = { xs: 200, sm: 240 };

function Preview({ src, dimmed = false }: { src?: string; dimmed?: boolean }) {
  return (
    <Box
      sx={{ position: 'relative', alignSelf: 'center', width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
    >
      <Avatar
        src={src}
        alt="Prévia da nova foto de perfil"
        sx={{
          width: '100%',
          height: '100%',
          border: '1px solid',
          borderColor: 'primary.main',
          opacity: dimmed ? 0.5 : 1,
        }}
      />
      {dimmed ? (
        <CircularProgress
          size={56}
          aria-hidden
          sx={{ position: 'absolute', inset: 0, m: 'auto' }}
        />
      ) : null}
    </Box>
  );
}

/** `autoFocus` does nothing on a `<label>`: the main action is focused by hand. */
const focusOnMount = (node: HTMLElement | null) => {
  node?.focus();
};

/** "Escolher outra": a label over a file input, so it opens the device picker. */
function PickAnotherButton({
  primary,
  children,
  onSelect,
}: {
  primary: boolean;
  children: ReactNode;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <PillButton
      component="label"
      tone={primary ? 'primaryFilled' : 'primarySoftOutline'}
      size="medium"
      ref={primary ? focusOnMount : undefined}
      sx={ACTION_SX}
    >
      {children}
      <Box
        component="input"
        type="file"
        accept={PROFILE_PICTURE_ACCEPT}
        hidden
        onChange={onSelect}
      />
    </PillButton>
  );
}

/**
 * Dialog of the photo change: a round preview to confirm, the wait while the
 * photo is sent (locked: no Escape, no backdrop click, no buttons) and an
 * error screen saying what happened and what to do next.
 */
export default function ProfilePictureDialog({
  dialog,
  previewUrl,
  hadPicture,
  onConfirm,
  onRetry,
  onSelect,
  onClose,
}: ProfilePictureDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  // Keeps the last view on screen while the dialog fades out.
  const [lastOpen, setLastOpen] = useState(dialog);
  if (dialog.view !== 'closed' && dialog !== lastOpen) setLastOpen(dialog);
  const current = dialog.view === 'closed' ? lastOpen : dialog;

  const sending = current.view === 'sending';
  const untouched = hadPicture
    ? 'Sua foto atual não foi alterada.'
    : 'Você continua sem foto de perfil.';

  let title = 'Usar esta foto?';
  if (current.view === 'sending') title = 'Enviando sua foto';
  if (current.view === 'error') title = current.screen.title;

  return (
    <Dialog
      open={dialog.view !== 'closed'}
      onClose={() => !sending && onClose()}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          'aria-busy': sending || undefined,
          sx: { borderRadius: 3, p: 1, mx: 2, maxWidth: { xs: '100%', sm: 420 } },
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pr: sending ? 3 : 7,
          minWidth: 0,
          wordBreak: 'break-word',
        }}
      >
        {current.view === 'error' ? <ErrorOutlineRoundedIcon color="error" aria-hidden /> : null}
        {title}
        {sending ? null : (
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            sx={{ position: 'absolute', top: 12, right: 12, width: 44, height: 44 }}
          >
            <CloseIcon aria-hidden />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} useFlexGap sx={{ minWidth: 0 }}>
          {current.view === 'confirm' ? (
            <>
              <Preview src={previewUrl} />
              <Typography id={descriptionId} sx={{ textAlign: 'center' }}>
                É assim que sua foto vai aparecer no seu perfil.
              </Typography>
              <Stack spacing={1} useFlexGap>
                <PillButton
                  tone="primaryFilled"
                  size="medium"
                  onClick={onConfirm}
                  autoFocus
                  sx={ACTION_SX}
                >
                  Usar esta foto
                </PillButton>
                <PickAnotherButton primary={false} onSelect={onSelect}>
                  Escolher outra
                </PickAnotherButton>
              </Stack>
            </>
          ) : null}

          {current.view === 'sending' ? (
            <>
              <Preview src={previewUrl} dimmed />
              <Box id={descriptionId} role="status" aria-live="polite" sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{STAGE_TEXT[current.stage]}</Typography>
                {current.slow ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {SLOW_TEXT}
                  </Typography>
                ) : null}
              </Box>
            </>
          ) : null}

          {current.view === 'error' ? (
            <>
              <Box id={descriptionId} role="alert">
                <Typography>{current.screen.message}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {untouched}
                </Typography>
              </Box>
              <Stack spacing={1} useFlexGap>
                {current.screen.canRetry ? (
                  <PillButton
                    tone="primaryFilled"
                    size="medium"
                    onClick={onRetry}
                    autoFocus
                    sx={ACTION_SX}
                  >
                    Tentar novamente
                  </PillButton>
                ) : null}
                {current.screen.canPickAnother ? (
                  <PickAnotherButton primary={!current.screen.canRetry} onSelect={onSelect}>
                    Escolher outra foto
                  </PickAnotherButton>
                ) : null}
                <PillButton
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={onClose}
                  sx={ACTION_SX}
                >
                  Fechar
                </PillButton>
              </Stack>
            </>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
