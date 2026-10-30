'use client';

import Button, { type ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import Link from 'next/link';
import { BUTTON_BORDER_RADIUS, FORM_ACTION_BUTTON_SX, colors, roleColors, v } from '@/theme/theme';

/**
 * Branded button — prefer this over raw MUI Button for product CTAs.
 * Every tone shares `BUTTON_BORDER_RADIUS` (rounded rectangle, not a stadium).
 * Extend with a new `tone` before creating another button component.
 * See AGENTS.md → UI component reuse.
 *
 * Tones map onto an action hierarchy, and the hierarchy is what the dark scheme
 * expresses: a primary action is an orange fill, a secondary action is an outline,
 * and a destructive action is red. In light mode every tone keeps its existing look.
 */
type PillButtonTone =
  | 'cta'
  | 'mission'
  | 'missionFlat'
  | 'missionOutline'
  | 'primaryOutline'
  | 'outline'
  | 'ghost'
  | 'primarySoftOutline'
  | 'primaryFilled'
  | 'missionFilled'
  | 'danger'
  | 'dangerOutline';

type PillButtonProps = ButtonProps & {
  href?: string;
  tone?: PillButtonTone;
  target?: string;
  rel?: string;
};

type ToneEntry = (theme: Theme) => Record<string, unknown>;

const baseSx = () => ({
  // Fallback label / fill colors for the loading spinner; tones override them.
  '--pill-fg': 'currentColor',
  '--pill-bg': 'var(--mui-palette-primary-main)',
  '--pill-bd': 'var(--mui-palette-primary-dark)',
  borderRadius: BUTTON_BORDER_RADIUS,
  ...FORM_ACTION_BUTTON_SX,
  py: 0.5,
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
  '&:active': {
    transform: 'translateY(1px)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:active': { transform: 'none' },
  },
});

/** Figma profile actions — mesmo tamanho compacto das demais ações. */
const figmaActionBase = {
  borderRadius: BUTTON_BORDER_RADIUS,
  ...FORM_ACTION_BUTTON_SX,
  py: 0.5,
  fontWeight: 500,
  lineHeight: 1.25,
  boxShadow: 'none',
} as const;

/**
 * Primary action in dark: the same dark brand orange as light (`mission.main`).
 * Hover only deepens the fill — no halo or drop-shadow.
 */
const darkPrimaryFill: ToneEntry = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: v(theme, 'palette.mission.main'),
    borderColor: v(theme, 'palette.mission.main'),
    color: v(theme, 'palette.mission.contrastText'),
    '--pill-fg': v(theme, 'palette.mission.contrastText'),
    '--pill-bg': v(theme, 'palette.mission.main'),
    '--pill-bd': v(theme, 'palette.mission.main'),
    '&:hover': {
      backgroundColor: v(theme, 'palette.mission.dark'),
      borderColor: v(theme, 'palette.mission.dark'),
      color: v(theme, 'palette.mission.contrastText'),
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: v(theme, 'palette.mission.dark'),
      borderColor: v(theme, 'palette.mission.dark'),
    },
  });

/**
 * The second CTA tier, in light blue.
 *
 * In the light theme this tone is the navy CTA. In dark it becomes the light
 * blue (`primary.main`) so the button still reads on the navy ground.
 */
const darkBrandFill: ToneEntry = (theme) => ({
  ...theme.applyStyles('dark', {
    backgroundColor: v(theme, 'palette.primary.main'),
    borderColor: v(theme, 'palette.primary.main'),
    color: v(theme, 'palette.primary.contrastText'),
    '--pill-fg': v(theme, 'palette.primary.contrastText'),
    '--pill-bg': v(theme, 'palette.primary.main'),
    '--pill-bd': v(theme, 'palette.primary.main'),
    '&:hover': {
      backgroundColor: v(theme, 'palette.primary.light'),
      borderColor: v(theme, 'palette.primary.light'),
      color: v(theme, 'palette.primary.contrastText'),
      boxShadow: '0 4px 14px rgba(147, 197, 253, 0.25)',
    },
    '&:active': {
      backgroundColor: v(theme, 'palette.primary.dark'),
    },
  }),
  '[data-auth-card] &': {
    backgroundColor: `${colors.primary} !important`,
    borderColor: `${colors.primary} !important`,
    color: `${colors.surface} !important`,
    boxShadow: 'none !important',
    '&:hover': {
      backgroundColor: `${roleColors.intermediate} !important`,
      borderColor: `${roleColors.intermediate} !important`,
      color: `${colors.surface} !important`,
      boxShadow: '0 4px 12px rgba(13, 43, 92, 0.2) !important',
    },
    '&:active': {
      backgroundColor: `${colors.textPrimary} !important`,
      borderColor: `${colors.textPrimary} !important`,
    },
  },
});

/** Secondary action in dark: quiet outline that never becomes a white block. */
const darkSecondaryOutline: ToneEntry = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: 'transparent',
    borderColor: v(theme, 'palette.action2.borderStrong'),
    color: v(theme, 'palette.text.primary'),
    '--pill-fg': v(theme, 'palette.text.primary'),
    '--pill-bg': 'transparent',
    '--pill-bd': v(theme, 'palette.action2.borderStrong'),
    '&:hover': {
      backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
      borderColor: v(theme, 'palette.connection.main'),
      color: v(theme, 'palette.text.primary'),
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
    },
  });

const hoverLightSx = {
  bgcolor: 'common.white',
  color: 'primary.main',
  borderColor: 'common.white',
  boxShadow: 'none',
};

const toneSx: Record<PillButtonTone, ToneEntry[]> = {
  cta: [
    () => ({
      border: '2px solid',
      borderColor: 'primary.dark',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '--pill-fg': 'var(--mui-palette-primary-contrastText)',
      '--pill-bg': 'var(--mui-palette-primary-main)',
      '--pill-bd': 'var(--mui-palette-primary-dark)',
      '&:hover': {
        bgcolor: 'connection.main',
        borderColor: 'connection.main',
        color: 'common.white',
        boxShadow: 'none',
      },
    }),
    darkBrandFill,
  ],
  mission: [
    () => ({
      border: '2px solid',
      borderColor: 'mission.dark',
      bgcolor: 'mission.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-mission-contrastText)',
      '--pill-bg': 'var(--mui-palette-mission-main)',
      '--pill-bd': 'var(--mui-palette-mission-dark)',
      '&:hover': {
        bgcolor: 'mission.dark',
        borderColor: 'mission.dark',
        color: 'mission.contrastText',
        boxShadow: 'none',
      },
    }),
    darkPrimaryFill,
  ],
  missionFlat: [
    () => ({
      border: '2px solid',
      borderColor: 'mission.dark',
      bgcolor: 'mission.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-mission-contrastText)',
      '--pill-bg': 'var(--mui-palette-mission-main)',
      '--pill-bd': 'var(--mui-palette-mission-dark)',
      '&:hover': {
        bgcolor: 'mission.dark',
        borderColor: 'mission.dark',
        color: 'mission.contrastText',
        boxShadow: 'none',
      },
    }),
    darkPrimaryFill,
  ],
  missionOutline: [
    () => ({
      border: '2px solid',
      borderColor: 'mission.main',
      bgcolor: 'transparent',
      color: 'accent.main',
      '&:hover': {
        bgcolor: 'accent.main',
        borderColor: 'mission.dark',
        color: 'mission.contrastText',
        boxShadow: 'none',
      },
    }),
    // Keeps its orange edge in dark: it is the outline that points at the primary action.
    (theme) =>
      theme.applyStyles('dark', {
        borderColor: v(theme, 'palette.accent.main'),
        color: v(theme, 'palette.accent.main'),
        '&:hover': {
          bgcolor: v(theme, 'palette.action2.fill'),
          borderColor: v(theme, 'palette.action2.fill'),
          color: v(theme, 'palette.action2.fillText'),
        },
      }),
  ],
  primaryOutline: [
    () => ({
      border: '2px solid',
      borderColor: 'primary.main',
      bgcolor: 'transparent',
      color: 'primary.main',
      '--pill-fg': 'var(--mui-palette-primary-main)',
      '--pill-bg': 'transparent',
      '--pill-bd': 'var(--mui-palette-primary-main)',
      '&:hover': {
        bgcolor: 'primary.main',
        borderColor: 'primary.dark',
        color: 'primary.contrastText',
        boxShadow: 'none',
      },
    }),
    darkSecondaryOutline,
  ],
  outline: [
    () => ({
      bgcolor: 'transparent',
      border: '2px solid',
      borderColor: 'primary.main',
      color: 'primary.main',
      '--pill-bg': 'transparent',
      '--pill-bd': 'var(--mui-palette-primary-main)',
      '&:hover': {
        ...hoverLightSx,
        borderColor: 'primary.main',
      },
    }),
    darkSecondaryOutline,
  ],
  ghost: [
    () => ({
      bgcolor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      color: 'common.white',
      '--pill-fg': 'var(--mui-palette-common-white)',
      '&:hover': hoverLightSx,
    }),
    // On a dark ground the white-block hover reads as a hole; keep it a wash.
    (theme) =>
      theme.applyStyles('dark', {
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.55)',
          color: 'common.white',
          boxShadow: 'none',
        },
      }),
  ],
  /** Figma profile secondary actions: Contato / Compartilhar / Editar */
  primarySoftOutline: [
    (theme) => ({
      ...figmaActionBase,
      // `&&` beats MUI `variant="text"`, which sets `border: 0`.
      //
      // `applyStyles` has to be nested *inside* this block, not alongside it:
      // its selector uses `:where()`, which contributes no specificity, so a
      // sibling dark rule would tie with `&&` and lose on source order — which
      // is what kept these buttons white in dark mode.
      '&&': {
        border: '1.5px solid',
        borderColor: 'primary.main',
        bgcolor: 'common.white',
        color: 'primary.main',
        '--pill-fg': 'var(--mui-palette-primary-main)',
        '--pill-bg': 'var(--mui-palette-common-white)',
        '--pill-bd': 'var(--mui-palette-primary-main)',
        ...theme.applyStyles('dark', {
          borderColor: v(theme, 'palette.action2.borderStrong'),
          backgroundColor: 'transparent',
          color: v(theme, 'palette.text.primary'),
          '--pill-fg': v(theme, 'palette.text.primary'),
          '--pill-bg': 'transparent',
          '--pill-bd': v(theme, 'palette.action2.borderStrong'),
        }),
        '[data-auth-card] &': {
          borderColor: `${colors.primary} !important`,
          backgroundColor: `${colors.surface} !important`,
          color: `${colors.primary} !important`,
          '--pill-fg': `${colors.primary} !important`,
          '--pill-bg': `${colors.surface} !important`,
          '--pill-bd': `${colors.primary} !important`,
        },
      },
      '&&:hover': {
        bgcolor: 'rgba(13, 43, 92, 0.04)',
        borderColor: 'primary.main',
        boxShadow: 'none',
        ...theme.applyStyles('dark', {
          backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
          borderColor: v(theme, 'palette.connection.main'),
        }),
        '[data-auth-card] &': {
          backgroundColor: 'rgba(13, 43, 92, 0.06) !important',
          borderColor: `${colors.textPrimary} !important`,
          color: `${colors.textPrimary} !important`,
          boxShadow: 'none !important',
        },
      },
    }),
  ],
  primaryFilled: [
    () => ({
      ...figmaActionBase,
      border: 'none',
      bgcolor: 'primary.main',
      color: 'common.white',
      '--pill-fg': 'var(--mui-palette-common-white)',
      '--pill-bg': 'var(--mui-palette-primary-main)',
      '--pill-bd': 'var(--mui-palette-primary-main)',
      '&:hover': {
        bgcolor: 'primary.dark',
        boxShadow: 'none',
      },
    }),
    darkBrandFill,
  ],
  missionFilled: [
    () => ({
      ...figmaActionBase,
      border: 'none',
      bgcolor: 'mission.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-mission-contrastText)',
      '--pill-bg': 'var(--mui-palette-mission-main)',
      '--pill-bd': 'var(--mui-palette-mission-main)',
      '&:hover': {
        bgcolor: 'mission.dark',
        boxShadow: 'none',
      },
    }),
    darkPrimaryFill,
  ],
  /** Destructive, filled — for the confirming step of a removal. */
  danger: [
    (theme) => ({
      ...figmaActionBase,
      border: 'none',
      bgcolor: v(theme, 'palette.action2.dangerFill'),
      color: 'common.white',
      '&:hover': {
        bgcolor: v(theme, 'palette.error.dark', v(theme, 'palette.action2.dangerFill')),
        boxShadow: `0 0 0 3px ${v(theme, 'palette.action2.dangerFill')}40`,
      },
    }),
  ],
  /** Destructive, quiet — the resting state of a delete affordance. */
  dangerOutline: [
    (theme) => ({
      ...figmaActionBase,
      '&&': {
        border: '1.5px solid',
        borderColor: v(theme, 'palette.action2.danger'),
        bgcolor: 'transparent',
        color: v(theme, 'palette.action2.danger'),
      },
      '&&:hover': {
        bgcolor: v(theme, 'palette.action2.dangerFill'),
        borderColor: v(theme, 'palette.action2.dangerFill'),
        color: 'common.white',
        boxShadow: 'none',
      },
    }),
  ],
};

/**
 * Disabled and loading, applied after the tone so they win.
 *
 * `&&` is needed because `primarySoftOutline` sets its colors at `&&`; without a
 * matching specificity a disabled button kept the enabled tone, which is what made
 * disabled indistinguishable from enabled before.
 *
 * MUI sets `disabled` while `loading`, so the loading button is excluded here —
 * otherwise every button went grey the moment it started working.
 */
const stateSx: ToneEntry = (theme) => ({
  '&&.Mui-disabled:not(.MuiButton-loading)': {
    backgroundColor: v(theme, 'palette.action2.disabledFill'),
    borderColor: v(theme, 'palette.action2.disabledBorder'),
    color: v(theme, 'palette.action2.disabledText'),
    boxShadow: 'none',
    cursor: 'not-allowed',
    pointerEvents: 'auto',
  },
  // MUI marks `loading` as `disabled` and paints `action.disabledBackground`
  // (near-white in dark mode). Keep the tone fill so the CTA does not vanish.
  '&&.MuiButton-loading': {
    backgroundColor: 'var(--pill-bg)',
    borderColor: 'var(--pill-bd)',
    opacity: 1,
  },
  // MUI paints the root `color: transparent` to hide the label while loading, so
  // the indicator cannot inherit it — each tone publishes its label color instead.
  '& .MuiButton-loadingIndicator': {
    color: 'var(--pill-fg, currentColor)',
  },
});

/** Lifts a scalar `minHeight` to every breakpoint so it beats a tone's responsive value. */
function normalizeMinHeight(sx: PillButtonProps['sx']): PillButtonProps['sx'] {
  if (!sx || typeof sx !== 'object' || Array.isArray(sx)) return sx;
  const value = (sx as Record<string, unknown>).minHeight;
  if (typeof value !== 'number' && typeof value !== 'string') return sx;
  return { ...(sx as object), minHeight: { xs: value, sm: value } } as PillButtonProps['sx'];
}

export type { PillButtonTone, PillButtonProps };

export default function PillButton({ href, tone = 'cta', sx, ...props }: PillButtonProps) {
  // The Figma tones carry a responsive `minHeight`, which outranks a plain scalar
  // from the call site in MUI's responsive merge — a caller asking for 48px was
  // silently rendering at 32px on desktop. Normalising it here lets the call site win.
  const callerSx = normalizeMinHeight(sx);
  const pillSx = [baseSx, ...toneSx[tone], stateSx, callerSx] as SxProps<Theme>;

  if (href) {
    return <Button component={Link} href={href} sx={pillSx} {...props} />;
  }

  return <Button sx={pillSx} {...props} />;
}
