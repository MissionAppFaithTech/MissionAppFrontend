'use client';

import { useEffect, useId, useState } from 'react';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import {
  FONT_SCALES,
  useA11yPreferencesStore,
  type A11yPreferences,
  type FontScale,
} from '@/stores/a11yPreferencesStore';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

const FONT_SCALE_LABELS: Record<FontScale, string> = {
  100: 'Padrão',
  115: 'Grande',
  130: 'Maior',
};

type ToggleKey = Exclude<keyof A11yPreferences, 'fontScale'>;

/** Plain-language copy: each option says what changes, not the WCAG jargon. */
const TOGGLES: Array<{ key: ToggleKey; label: string; description: string }> = [
  {
    key: 'highContrast',
    label: 'Alto contraste',
    description: 'Deixa textos e bordas mais escuros e fáceis de distinguir.',
  },
  {
    key: 'reduceMotion',
    label: 'Reduzir movimento',
    description: 'Desliga animações, transições e carrosséis automáticos.',
  },
  {
    key: 'readableFont',
    label: 'Fonte de leitura fácil',
    description: 'Usa a fonte Atkinson Hyperlegible, pensada para baixa visão e dislexia.',
  },
  {
    key: 'textSpacing',
    label: 'Mais espaço entre letras e linhas',
    description: 'Aumenta o espaçamento para facilitar a leitura.',
  },
  {
    key: 'underlineLinks',
    label: 'Sublinhar links',
    description: 'Mostra todos os links sublinhados, sem depender da cor.',
  },
];

/** Restores saved preferences on the client (the pre-paint script already set the DOM). */
export function A11yPreferencesSync() {
  useEffect(() => {
    void useA11yPreferencesStore.persist.rehydrate();
  }, []);
  return null;
}

type AccessibilityPreferencesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AccessibilityPreferencesDialog({
  open,
  onClose,
}: AccessibilityPreferencesDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const prefs = useA11yPreferencesStore();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{
        paper: {
          sx: {
            m: { xs: 1.5, sm: 2 },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
            borderRadius: { xs: 2.5, sm: 3 },
          },
        },
      }}
    >
      <DialogTitle
        id={titleId}
        component="h2"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 7, fontWeight: 700 }}
      >
        <AccessibilityNewIcon aria-hidden color="primary" />
        Acessibilidade
      </DialogTitle>
      <IconButton
        aria-label="Fechar preferências de acessibilidade"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, width: 44, height: 44 }}
      >
        <CloseIcon aria-hidden />
      </IconButton>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            Ajuste a leitura do jeito que for melhor para você. As escolhas ficam salvas neste
            aparelho.
          </Typography>

          <Stack spacing={1} component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
            <Typography component="legend" variant="subtitle2" sx={{ fontWeight: 700, p: 0 }}>
              Tamanho do texto
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={prefs.fontScale}
              onChange={(_, value: FontScale | null) => {
                if (value) prefs.setPreference('fontScale', value);
              }}
              sx={{ flexWrap: 'wrap' }}
            >
              {FONT_SCALES.map((scale) => (
                <ToggleButton
                  key={scale}
                  value={scale}
                  sx={{ minHeight: 44, minWidth: 88, textTransform: 'none', fontWeight: 600 }}
                >
                  {FONT_SCALE_LABELS[scale]} ({scale}%)
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Stack spacing={1.5}>
            {TOGGLES.map(({ key, label, description }) => (
              <FormControlLabel
                key={key}
                sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
                control={
                  <Switch
                    checked={prefs[key]}
                    onChange={(event) => prefs.setPreference(key, event.target.checked)}
                    slotProps={{ input: { 'aria-describedby': `${descriptionId}-${key}` } }}
                  />
                }
                label={
                  <Stack spacing={0.25} sx={{ pt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography
                      id={`${descriptionId}-${key}`}
                      variant="body2"
                      color="text.secondary"
                    >
                      {description}
                    </Typography>
                  </Stack>
                }
              />
            ))}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 1.5,
          '& > :not(style) ~ :not(style)': { ml: 0 },
          '& .MuiButton-root': {
            ...FORM_ACTION_BUTTON_SX,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: 'center',
          },
        }}
      >
        <PillButton tone="primarySoftOutline" onClick={prefs.reset}>
          Restaurar padrão
        </PillButton>
        <PillButton tone="primaryFilled" onClick={onClose}>
          Concluir
        </PillButton>
      </DialogActions>
    </Dialog>
  );
}

/** Opens the accessibility preferences; place it next to the theme toggle in headers. */
export default function AccessibilityPreferencesButton(props: Omit<IconButtonProps, 'onClick'>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        aria-label="Preferências de acessibilidade"
        aria-haspopup="dialog"
        size="large"
        {...props}
        onClick={() => setOpen(true)}
        sx={[
          { color: 'inherit', minWidth: 44, minHeight: 44 },
          ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
        ]}
      >
        <AccessibilityNewIcon aria-hidden />
      </IconButton>
      <AccessibilityPreferencesDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
