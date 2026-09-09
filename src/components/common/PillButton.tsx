'use client';

import Button, { type ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import Link from 'next/link';
import { v } from '@/theme/theme';

/**
 * Branded button — prefer this over raw MUI Button for product CTAs.
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
  // Fallback label color for the loading spinner; tones override it.
  '--pill-fg': 'currentColor',
  borderRadius: '16px',
  py: 0.5,
  px: 2,
  fontWeight: 500,
  fontSize: '0.9375rem',
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

/** Figma profile actions — um pouco mais compactos que o default do MUI. */
const figmaActionBase = {
  borderRadius: '10px',
  minHeight: { xs: 44, sm: 32 },
  py: 0.5,
  px: 1.75,
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.25,
  boxShadow: 'none',
} as const;

/**
 * Primary action in dark: the brand orange fill.
 *
 * Hover lifts the fill only slightly — anything lighter drops white text below
 * 4.5:1 — so the perceptible change comes from an accent halo instead.
 */
const darkPrimaryFill: ToneEntry = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: v(theme, 'palette.action2.fill'),
    borderColor: v(theme, 'palette.action2.fill'),
    color: v(theme, 'palette.action2.fillText'),
    '--pill-fg': v(theme, 'palette.action2.fillText'),
    '&:hover': {
      backgroundColor: v(theme, 'palette.action2.fillHover'),
      borderColor: v(theme, 'palette.action2.fillHover'),
      color: v(theme, 'palette.action2.fillText'),
      boxShadow: `0 0 0 3px ${v(theme, 'palette.action2.accentWash')}`,
    },
    '&:active': {
      backgroundColor: v(theme, 'palette.action2.fillActive'),
      borderColor: v(theme, 'palette.action2.fillActive'),
    },
  });

/**
 * The second CTA tier, in light blue.
 *
 * In the light theme this tone is the navy CTA. The black theme has no navy, so it
 * takes the palette's light blue instead — which keeps the two-tier CTA language
 * the app already had, gives "navigation" actions like Continuar and the role
 * choice a fill of their own, and leaves orange scarce enough to still mean
 * "the primary action". Black ink on the blue reads at 8.52:1.
 */
const darkBrandFill: ToneEntry = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: v(theme, 'palette.primary.main'),
    borderColor: v(theme, 'palette.primary.main'),
    color: v(theme, 'palette.primary.contrastText'),
    '--pill-fg': v(theme, 'palette.primary.contrastText'),
    '&:hover': {
      backgroundColor: v(theme, 'palette.primary.light'),
      borderColor: v(theme, 'palette.primary.light'),
      color: v(theme, 'palette.primary.contrastText'),
      boxShadow: `0 0 0 3px ${v(theme, 'palette.action2.secondaryHoverWash')}`,
    },
    '&:active': {
      backgroundColor: v(theme, 'palette.primary.dark'),
    },
  });

/** Secondary action in dark: quiet outline that never becomes a white block. */
const darkSecondaryOutline: ToneEntry = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: 'transparent',
    borderColor: v(theme, 'palette.action2.borderStrong'),
    color: v(theme, 'palette.text.primary'),
    '--pill-fg': v(theme, 'palette.text.primary'),
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
      bgcolor: 'accent.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-mission-contrastText)',
      '&:hover': {
        bgcolor: 'connection.main',
        borderColor: 'connection.main',
        color: 'common.white',
        boxShadow: 'none',
      },
    }),
    darkPrimaryFill,
  ],
  missionFlat: [
    () => ({
      border: '2px solid',
      borderColor: 'mission.dark',
      borderRadius: '6px',
      bgcolor: 'accent.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-mission-contrastText)',
      '&:hover': {
        bgcolor: 'connection.main',
        borderColor: 'connection.main',
        color: 'common.white',
        boxShadow: 'none',
      },
    }),
    darkPrimaryFill,
  ],
  missionOutline: [
    () => ({
      border: '2px solid',
      borderColor: 'mission.main',
      borderRadius: '6px',
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
      borderRadius: '6px',
      bgcolor: 'transparent',
      color: 'primary.main',
      '--pill-fg': 'var(--mui-palette-primary-main)',
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
        ...theme.applyStyles('dark', {
          borderColor: v(theme, 'palette.action2.borderStrong'),
          backgroundColor: 'transparent',
          color: v(theme, 'palette.text.primary'),
          '--pill-fg': v(theme, 'palette.text.primary'),
        }),
      },
      '&&:hover': {
        bgcolor: 'rgba(13, 43, 92, 0.04)',
        borderColor: 'primary.main',
        boxShadow: 'none',
        ...theme.applyStyles('dark', {
          backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
          borderColor: v(theme, 'palette.connection.main'),
        }),
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
      bgcolor: 'accent.main',
      color: 'mission.contrastText',
      '--pill-fg': 'var(--mui-palette-common-white)',
      '&:hover': {
        bgcolor: 'accent.dark',
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
