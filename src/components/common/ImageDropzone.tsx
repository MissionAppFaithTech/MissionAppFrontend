'use client';

import { useId, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

type ImageDropzoneProps = {
  /** Accessible name of the file input, e.g. "Upload de foto de capa". */
  inputLabel: string;
  /** Called with the chosen (or dropped) file; the host validates it. */
  onSelect: (file: File) => void;
  /** Current image (a saved URL or a local preview); `null` shows the empty box. */
  previewUrl?: string | null;
  previewAlt?: string;
  /** Visible text of the empty box. */
  emptyTitle?: string;
  /** Visible text of the bar over the image, once there is one. */
  changeLabel?: string;
  /** Shown in the empty box instead of the call to action (e.g. "still processing"). */
  emptyNotice?: string;
  helperText?: string;
  error?: string | null;
  accept?: string;
  disabled?: boolean;
  /** Extra content under the box (kept inside the same label). */
  children?: ReactNode;
};

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * A clickable image box: click (or Enter/Space on the focused input) opens the
 * file picker, dropping an image works too, and the chosen image replaces the
 * box content as a preview. The native file input stays focusable, so keyboard
 * and screen reader users get the same control.
 */
export default function ImageDropzone({
  inputLabel,
  onSelect,
  previewUrl = null,
  previewAlt = 'Prévia da imagem',
  emptyTitle = 'Clique para escolher uma foto',
  changeLabel = 'Alterar foto',
  emptyNotice,
  helperText,
  error,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  children,
}: ImageDropzoneProps) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const [dragging, setDragging] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the same file be chosen again after a rejection.
    event.target.value = '';
    if (file) onSelect(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onSelect(file);
  };

  const describedBy = [helperText ? helpId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        component="label"
        htmlFor={inputId}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: { xs: 180, sm: 240, md: 280 },
          overflow: 'hidden',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: error ? 'error.main' : dragging ? 'primary.main' : 'divider',
          bgcolor: dragging ? 'action.selected' : 'action.hover',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          px: 2,
          py: 3,
          textAlign: 'center',
          '&:hover': disabled ? undefined : { borderColor: 'primary.main' },
          '&:focus-within': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Box
          component="input"
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled}
          aria-label={inputLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={handleChange}
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            overflow: 'hidden',
          }}
        />

        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={previewAlt}
              fill
              unoptimized
              sizes="(max-width: 600px) 100vw, 800px"
              style={{ objectFit: 'cover' }}
            />
            {/* Always visible: touch screens have no hover. */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                bgcolor: 'rgba(0, 0, 0, 0.72)',
                color: 'common.white',
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
                {changeLabel}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <AddPhotoAlternateOutlinedIcon
              aria-hidden
              sx={{ fontSize: 44, color: error ? 'error.main' : 'primary.main', mb: 1 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {emptyNotice ?? emptyTitle}
            </Typography>
            {!emptyNotice && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                ou arraste e solte aqui
              </Typography>
            )}
          </>
        )}
      </Box>

      {helperText && (
        <Typography
          id={helpId}
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.75 }}
        >
          {helperText}
        </Typography>
      )}
      {error && (
        <Typography
          id={errorId}
          role="alert"
          variant="caption"
          color="error"
          sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}
        >
          {error}
        </Typography>
      )}
      {children}
    </Box>
  );
}
