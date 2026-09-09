import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

/** UI color tokens */
export const colors = {
  primary: '#0D2B5C',
  secondary: '#C2410C',

  success: '#15803D',
  warning: '#B45309',
  error: '#DC2626',

  background: '#F7F9FC',
  surface: '#FFFFFF',

  textPrimary: '#081C3A',
  textSecondary: '#475569',

  border: '#CBD5E1',
} as const;

export const roleColors = {
  missionary: '#0D2B5C',
  supporter: '#6BA6FF',
  intermediate: '#2563EB',
  mission: '#C2410C',
} as const;

/** Derived shades for MUI palette variants */
const shades = {
  primaryLight: '#1A3D6E',
  supporterLight: '#93C5FD',
  supporterDark: '#4F8FE6',
  intermediateLight: '#3B82F6',
  intermediateDark: '#1D4ED8',
  missionLight: '#EA580C',
  missionDark: '#9A3412',
  surfaceMuted: '#EAF1FA',
} as const;

export const brandGradient = `linear-gradient(135deg, ${roleColors.missionary} 0%, ${roleColors.intermediate} 100%)`;

/**
 * Semantic tokens per color scheme.
 *
 * Both objects share the same keys on purpose: a component asks for a *role*
 * ("the fill of a primary action") and the active scheme decides the value.
 * Light values reproduce the previous theme exactly — light must not shift.
 *
 * Every dark value below is contrast-checked; the ratio in the comment is
 * against the surface it is meant to sit on.
 */
export type ModeTokens = {
  /** Page background. */
  canvas: string;
  /** Resting surface: cards, paper. */
  surface1: string;
  /** Raised surface: dialog, menu, drawer, input, hover. */
  surface2: string;
  borderSubtle: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  /** Primary action fill — must carry `actionFillText` at >= 4.5:1. */
  actionFill: string;
  actionFillHover: string;
  actionFillActive: string;
  actionFillText: string;
  /** Orange mark on the canvas: indicators, focus, active state. Never a fill behind white text. */
  accent: string;
  accentSoft: string;
  /** Translucent orange for halos and washes. */
  accentWash: string;
  link: string;
  linkHover: string;
  /** Secondary (outlined) action hover wash. */
  secondaryHoverWash: string;
  focusRing: string;
  disabledFill: string;
  disabledText: string;
  disabledBorder: string;
  /** Destructive: text and outline. */
  danger: string;
  /** Destructive: fill that carries white text. */
  dangerFill: string;
  fieldBg: string;
  fieldBgDisabled: string;
  /** Filled brand surface (toasts, avatar badges) — carries `brandFillText`. */
  brandFill: string;
  brandFillText: string;
  /** Avatar placeholder circle and its initials. */
  avatarFill: string;
  avatarText: string;
};

export const lightTokens: ModeTokens = {
  canvas: colors.background,
  surface1: colors.surface,
  surface2: shades.surfaceMuted,
  borderSubtle: `${colors.border}33`,
  borderStrong: colors.border,
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textDisabled: 'rgba(8, 28, 58, 0.38)',
  actionFill: colors.primary,
  actionFillHover: roleColors.intermediate,
  actionFillActive: colors.textPrimary,
  actionFillText: colors.surface,
  accent: roleColors.mission,
  accentSoft: shades.missionLight,
  accentWash: 'rgba(194, 65, 12, 0.10)',
  link: roleColors.intermediate,
  linkHover: shades.intermediateDark,
  secondaryHoverWash: 'rgba(13, 43, 92, 0.04)',
  focusRing: colors.primary,
  disabledFill: 'rgba(13, 43, 92, 0.10)',
  disabledText: 'rgba(8, 28, 58, 0.38)',
  disabledBorder: 'rgba(13, 43, 92, 0.16)',
  danger: colors.error,
  dangerFill: colors.error,
  fieldBg: shades.surfaceMuted,
  fieldBgDisabled: 'rgba(13, 43, 92, 0.04)',
  brandFill: colors.primary,
  brandFillText: colors.surface,
  avatarFill: shades.supporterLight,
  avatarText: '#000000',
};

export const darkTokens: ModeTokens = {
  /**
   * A true black ground. The brand navy belongs to the light theme; here the page
   * is neutral and the only chromatic elements are the two brand accents, which
   * read stronger on black than they ever did on navy (orange 7.49:1 vs 6.05:1).
   */
  canvas: '#000000',
  surface1: '#121212' /* cards — 17.18:1 with textPrimary */,
  surface2: '#1C1C1C' /* dialogs, menus, inputs, hover */,
  borderSubtle: 'rgba(255, 255, 255, 0.12)' /* hairline between surfaces */,
  borderStrong: 'rgba(255, 255, 255, 0.42)' /* 4.12:1 on surface1 — SC 1.4.11 */,
  textPrimary: '#FFFFFF' /* 21:1 on canvas */,
  /* White too: on black the hierarchy is carried by size and weight, not by
     dimming the text. Only the disabled state stays muted, so it still reads
     as unavailable. */
  textSecondary: '#FFFFFF' /* 21:1 on canvas */,
  textDisabled: 'rgba(245, 245, 245, 0.38)',
  /** Black ink on vivid orange — 7.06:1, which the navy ground never allowed. */
  actionFill: '#F97316',
  actionFillHover: '#FB923C' /* 8.75:1 with the same ink */,
  actionFillActive: '#EA580C' /* 5.56:1 */,
  actionFillText: '#0A0A0A',
  accent: '#F97316' /* 7.49:1 on canvas, 5.54:1 on the raised surface */,
  accentSoft: '#FB923C',
  accentWash: 'rgba(249, 115, 22, 0.28)',
  link: roleColors.supporter /* #6BA6FF — 8.52:1 on canvas */,
  linkHover: shades.supporterLight /* #93C5FD — 11.65:1 */,
  secondaryHoverWash: 'rgba(107, 166, 255, 0.14)',
  focusRing: '#F97316',
  disabledFill: 'rgba(255, 255, 255, 0.08)',
  disabledText: 'rgba(245, 245, 245, 0.38)',
  disabledBorder: 'rgba(255, 255, 255, 0.16)',
  danger: '#F87171' /* 7.59:1 on canvas */,
  dangerFill: colors.error /* #DC2626 — white text 4.83:1 */,
  fieldBg: 'rgba(255, 255, 255, 0.06)',
  fieldBgDisabled: 'rgba(255, 255, 255, 0.03)',
  /** Toasts and badges sit a neutral step above the card, so color stays reserved. */
  brandFill: '#242424',
  brandFillText: '#FFFFFF',
  avatarFill: colors.surface /* white circle with a navy figure — 13.84:1 */,
  avatarText: colors.primary,
};

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }
  interface Palette {
    connection: Palette['primary'];
    supporter: Palette['primary'];
    mission: Palette['primary'];
    surface: Palette['primary'];
    /** Orange emphasis: indicators, focus, active state. */
    accent: Palette['primary'];
    /** Filled brand surface: toasts, avatar badges. */
    brandFill: Palette['primary'];
    /** Avatar placeholder circle. */
    avatar: Palette['primary'];
    /** Semantic action tokens for the active color scheme. */
    action2: {
      fill: string;
      fillHover: string;
      fillActive: string;
      fillText: string;
      accentWash: string;
      secondaryHoverWash: string;
      borderSubtle: string;
      borderStrong: string;
      focusRing: string;
      disabledFill: string;
      disabledText: string;
      disabledBorder: string;
      danger: string;
      dangerFill: string;
      surface2: string;
      fieldBg: string;
      fieldBgDisabled: string;
    };
  }
  interface PaletteOptions {
    connection?: PaletteOptions['primary'];
    supporter?: PaletteOptions['primary'];
    mission?: PaletteOptions['primary'];
    surface?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
    brandFill?: PaletteOptions['primary'];
    avatar?: PaletteOptions['primary'];
    action2?: Palette['action2'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    connection: true;
    supporter: true;
    mission: true;
  }
}

const fontFamily = 'var(--font-dm-sans), "DM Sans", sans-serif';

function createTypography(): ThemeOptions['typography'] {
  return {
    fontFamily,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    fontSize: 16,
    h1: {
      fontWeight: 700,
      lineHeight: 1.15,
      fontSize: '2rem',
      '@media (min-width:600px)': { fontSize: '2.5rem' },
      '@media (min-width:900px)': { fontSize: '3rem' },
      '@media (min-width:1200px)': { fontSize: '3.5rem' },
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.2,
      fontSize: '2rem',
      '@media (min-width:900px)': { fontSize: '2.25rem' },
      '@media (min-width:1200px)': { fontSize: '2.5rem' },
    },
    h3: {
      fontWeight: 600,
      lineHeight: 1.25,
      fontSize: '1.75rem',
      '@media (min-width:900px)': { fontSize: '2rem' },
    },
    h4: {
      fontWeight: 600,
      lineHeight: 1.3,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.35,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: '1.125rem',
    },
    subtitle1: {
      fontWeight: 400,
      lineHeight: 1.75,
      fontSize: '1rem',
      '@media (min-width:900px)': { fontSize: '1.125rem' },
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '1.1rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.9375rem',
      textTransform: 'none',
    },
  };
}

/**
 * Palette per color scheme.
 *
 * Everything that carries meaning is branched. The previous theme spread a single
 * `extendedPalette` into both schemes, so `success`, `warning`, `error`, `mission`,
 * `supporter` and `surface` were light-mode colors rendered on a dark ground.
 */
function buildPalette(mode: 'light' | 'dark') {
  const isLight = mode === 'light';
  const t = isLight ? lightTokens : darkTokens;

  return {
    primary: isLight
      ? {
          main: colors.primary,
          light: shades.primaryLight,
          dark: colors.textPrimary,
          contrastText: colors.surface,
        }
      : {
          main: roleColors.supporter,
          light: shades.supporterLight,
          dark: shades.supporterDark,
          contrastText: t.actionFillText,
        },
    secondary: isLight
      ? {
          main: colors.secondary,
          light: shades.missionLight,
          dark: shades.missionDark,
          contrastText: colors.surface,
        }
      : {
          main: t.actionFill,
          light: t.accent,
          dark: t.actionFillActive,
          contrastText: t.actionFillText,
        },
    connection: isLight
      ? {
          main: roleColors.intermediate,
          light: shades.intermediateLight,
          dark: shades.intermediateDark,
          contrastText: colors.surface,
        }
      : {
          main: t.link,
          light: t.linkHover,
          dark: roleColors.supporter,
          contrastText: t.actionFillText,
        },
    supporter: isLight
      ? {
          main: roleColors.supporter,
          light: shades.supporterLight,
          dark: shades.supporterDark,
          contrastText: roleColors.missionary,
        }
      : {
          main: roleColors.supporter,
          light: shades.supporterLight,
          dark: shades.supporterDark,
          contrastText: t.actionFillText,
        },
    mission: isLight
      ? {
          main: roleColors.mission,
          light: shades.missionLight,
          dark: shades.missionDark,
          contrastText: colors.surface,
        }
      : {
          main: t.actionFill,
          light: t.accent,
          dark: t.actionFillActive,
          contrastText: t.actionFillText,
        },
    brandFill: {
      main: t.brandFill,
      light: t.surface2,
      dark: t.canvas,
      contrastText: t.brandFillText,
    },
    avatar: {
      main: t.avatarFill,
      light: t.avatarFill,
      dark: t.avatarFill,
      contrastText: t.avatarText,
    },
    /**
     * Orange as a *mark*: eyebrows, icons, indicators, badges.
     *
     * Light mirrors `mission` exactly so swapping a component from `mission.*` to
     * `accent.*` cannot shift the light theme. On black the whole orange family
     * clears AA, so dark simply runs its brighter end.
     */
    accent: isLight
      ? {
          main: roleColors.mission,
          light: shades.missionLight,
          dark: shades.missionDark,
          contrastText: colors.surface,
        }
      : {
          main: t.accent,
          light: t.accentSoft,
          dark: t.accentSoft,
          contrastText: t.actionFillText,
        },
    surface: isLight
      ? {
          main: shades.surfaceMuted,
          light: colors.surface,
          dark: '#D5E4F4',
          contrastText: roleColors.missionary,
        }
      : {
          main: t.surface2,
          light: t.surface1,
          dark: t.canvas,
          contrastText: t.textPrimary,
        },
    /**
     * `main` is the value that must read as a *mark* on the scheme's own surface
     * (helper text, progress bar, icon). `contrastText` is what sits on top when
     * the color is used as a fill — a filled Alert, for instance. A single value
     * cannot do both on a dark ground, so the fill flips to dark text there.
     */
    success: isLight
      ? { main: colors.success, contrastText: colors.surface }
      : {
          main: '#22C55E',
          light: '#4ADE80',
          dark: colors.success,
          contrastText: t.actionFillText,
        },
    warning: isLight
      ? { main: colors.warning, contrastText: colors.surface }
      : {
          main: '#FBBF24',
          light: '#FCD34D',
          dark: colors.warning,
          contrastText: t.actionFillText,
        },
    error: isLight
      ? { main: colors.error, contrastText: colors.surface }
      : { main: t.danger, light: '#FCA5A5', dark: t.dangerFill, contrastText: t.actionFillText },
    info: isLight
      ? { main: roleColors.intermediate, contrastText: colors.surface }
      : { main: t.link, contrastText: t.actionFillText },
    background: {
      default: t.canvas,
      paper: t.surface1,
    },
    text: {
      primary: t.textPrimary,
      secondary: t.textSecondary,
      disabled: t.textDisabled,
    },
    divider: t.borderSubtle,
    action2: {
      fill: t.actionFill,
      fillHover: t.actionFillHover,
      fillActive: t.actionFillActive,
      fillText: t.actionFillText,
      accentWash: t.accentWash,
      secondaryHoverWash: t.secondaryHoverWash,
      borderSubtle: t.borderSubtle,
      borderStrong: t.borderStrong,
      focusRing: t.focusRing,
      disabledFill: t.disabledFill,
      disabledText: t.disabledText,
      disabledBorder: t.disabledBorder,
      danger: t.danger,
      dangerFill: t.dangerFill,
      surface2: t.surface2,
      fieldBg: t.fieldBg,
      fieldBgDisabled: t.fieldBgDisabled,
    },
  };
}

/**
 * Reads a palette value as a CSS variable when the theme runs on CSS variables,
 * so the value follows the active color scheme instead of freezing the default one.
 */
export function v(theme: Theme, path: string, fallback = 'currentColor'): string {
  const source = (theme.vars ?? theme) as unknown as Record<string, unknown>;
  const resolved = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], source);
  // Falls back when a custom palette key is missing — e.g. a unit test that renders
  // a component against MUI's default theme instead of the app theme.
  return typeof resolved === 'string' ? resolved : fallback;
}

/**
 * The one focus ring for the whole app.
 *
 * An outline rather than a box-shadow, so it never competes with the hover halo on
 * the primary action. The 2px offset puts the surface color between the button and
 * the ring, which is what keeps an orange ring legible on an orange fill.
 */
export function focusRingSx(theme: Theme) {
  return {
    outline: `2px solid ${v(theme, 'palette.action2.focusRing')}`,
    outlineOffset: '2px',
  };
}

/**
 * MUI only adds `Mui-focusVisible` for focus it detects itself, and matches the
 * native `:focus-visible` otherwise — so the ring has to answer to both.
 */
export function focusVisibleSx(theme: Theme) {
  return {
    '&:focus-visible, &.Mui-focusVisible': focusRingSx(theme),
  };
}

export function createAppTheme() {
  return createTheme({
    cssVariables: { colorSchemeSelector: 'class' },
    defaultColorScheme: 'light',
    // One ring for every ButtonBase-derived control; MUI handles inset rings on
    // clip-prone components (Tab, MenuItem) that a manual outline cannot reach.
    focusVisible: {
      outlineStyle: 'solid',
      outlineWidth: 2,
      outlineOffset: 2,
      outlineColor: 'var(--mui-palette-action2-focusRing)',
    },
    colorSchemes: {
      light: { palette: buildPalette('light') },
      dark: { palette: buildPalette('dark') },
    },
    typography: createTypography(),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--mui-palette-background-default)',
            color: 'var(--mui-palette-text-primary)',
          },
          // Scoped away from ButtonBase so a PillButton rendered as a link keeps its
          // tone. `:where()` keeps the selector at specificity (0,0,1) — with a bare
          // `:not()` it was (0,1,1) and outranked every `sx` color on a plain <a>,
          // which silently painted links like the bottom nav blue.
          'a:where(:not(.MuiButtonBase-root))': {
            color: 'var(--mui-palette-connection-main)',
            '&:hover': {
              color: 'var(--mui-palette-connection-light)',
            },
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: ({ theme }) => focusVisibleSx(theme),
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: 'small',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 4,
            minHeight: 38,
            '@media (max-width:600px)': {
              minHeight: 44,
            },
            '& .MuiButton-loadingIndicator': {
              color: 'var(--pill-fg, currentColor)',
            },
            // `loading` also sets `disabled`; keep the loading button looking active.
            '&.Mui-disabled:not(.MuiButton-loading)': {
              color: v(theme, 'palette.action2.disabledText'),
            },
          }),
        },
        variants: [
          {
            props: { color: 'primary' as const, variant: 'contained' as const },
            style: ({ theme }: { theme: Theme }) =>
              theme.applyStyles('dark', {
                backgroundColor: v(theme, 'palette.action2.fill'),
                color: v(theme, 'palette.action2.fillText'),
                '&:hover': {
                  backgroundColor: v(theme, 'palette.action2.fillHover'),
                  boxShadow: `0 0 0 3px ${v(theme, 'palette.action2.accentWash')}`,
                },
                '&:active': {
                  backgroundColor: v(theme, 'palette.action2.fillActive'),
                },
                '&.Mui-disabled:not(.MuiButton-loading)': {
                  backgroundColor: v(theme, 'palette.action2.disabledFill'),
                  color: v(theme, 'palette.action2.disabledText'),
                },
              }),
          },
          {
            props: { color: 'primary' as const, variant: 'text' as const },
            style: ({ theme }: { theme: Theme }) =>
              theme.applyStyles('dark', {
                color: v(theme, 'palette.connection.main'),
                '&:hover': {
                  backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
                },
              }),
          },
          {
            props: { color: 'secondary' as const, variant: 'contained' as const },
            style: {
              '&:hover': {
                backgroundColor: 'var(--mui-palette-connection-main)',
                color: 'var(--mui-palette-common-white)',
              },
            },
          },
          {
            props: { color: 'primary' as const, variant: 'outlined' as const },
            style: ({ theme }: { theme: Theme }) => [
              {
                borderColor: v(theme, 'palette.primary.main'),
                color: v(theme, 'palette.primary.main'),
                '&:hover': {
                  borderColor: v(theme, 'palette.connection.main'),
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                },
              },
              theme.applyStyles('dark', {
                borderColor: v(theme, 'palette.action2.borderStrong'),
                color: v(theme, 'palette.text.primary'),
                '&:hover': {
                  borderColor: v(theme, 'palette.connection.main'),
                  backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
                },
              }),
            ],
          },
          {
            props: { color: 'supporter' as const, variant: 'contained' as const },
            style: {
              backgroundColor: 'var(--mui-palette-supporter-main)',
              color: 'var(--mui-palette-supporter-contrastText)',
              '&:hover': {
                backgroundColor: 'var(--mui-palette-connection-main)',
                color: 'var(--mui-palette-common-white)',
              },
            },
          },
          {
            props: { color: 'mission' as const, variant: 'contained' as const },
            style: ({ theme }: { theme: Theme }) => [
              {
                backgroundColor: v(theme, 'palette.mission.main'),
                color: v(theme, 'palette.mission.contrastText'),
                '&:hover': {
                  backgroundColor: v(theme, 'palette.connection.main'),
                },
              },
              theme.applyStyles('dark', {
                '&:hover': {
                  backgroundColor: v(theme, 'palette.action2.fillHover'),
                  boxShadow: `0 0 0 3px ${v(theme, 'palette.action2.accentWash')}`,
                },
              }),
            ],
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => [
            {
              minWidth: 36,
              minHeight: 36,
              '@media (max-width:600px)': {
                minWidth: 44,
                minHeight: 44,
              },
              '&:hover': {
                color: v(theme, 'palette.connection.main'),
              },
            },
            theme.applyStyles('dark', {
              '&:hover': {
                color: v(theme, 'palette.accent.main'),
                backgroundColor: v(theme, 'palette.action2.secondaryHoverWash'),
              },
            }),
          ],
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: 'var(--mui-palette-accent-main)',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              color: v(theme, 'palette.text.secondary'),
              '&.Mui-selected': {
                color: v(theme, 'palette.accent.main'),
              },
            }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.disabledFill'),
            }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) =>
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.surface2'),
              backgroundImage: 'none',
              border: `1px solid ${v(theme, 'palette.action2.borderSubtle')}`,
            }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) =>
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.surface2'),
              backgroundImage: 'none',
            }),
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) =>
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.surface2'),
              backgroundImage: 'none',
              border: `1px solid ${v(theme, 'palette.action2.borderSubtle')}`,
            }),
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: ({ theme }) =>
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.surface2'),
              backgroundImage: 'none',
            }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => [
            {
              // `size="small"` fields landed at 33px, under the 44px touch target
              // the project requires on phones.
              '@media (max-width:600px)': {
                minHeight: 44,
              },
            },
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.fieldBg'),
              color: v(theme, 'palette.text.primary'),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.action2.borderSubtle'),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.action2.borderStrong'),
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.connection.main'),
                borderWidth: 2,
              },
              '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.error.main'),
              },
              '&.Mui-disabled': {
                backgroundColor: v(theme, 'palette.action2.fieldBgDisabled'),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: v(theme, 'palette.action2.disabledBorder'),
                },
              },
            }),
          ],
          input: ({ theme }) =>
            theme.applyStyles('dark', {
              color: v(theme, 'palette.text.primary'),
              // The one text that stays dimmed. Body copy is white, but a
              // placeholder has to read as "not filled in yet" — at the same white
              // as a typed value it looks like the field already has content.
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.55)',
                opacity: 1,
              },
            }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              color: v(theme, 'palette.text.secondary'),
              '&.Mui-focused': {
                color: v(theme, 'palette.connection.main'),
              },
              '&.Mui-error': {
                color: v(theme, 'palette.error.main'),
              },
            }),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              color: v(theme, 'palette.text.secondary'),
              '&.Mui-error': {
                color: v(theme, 'palette.error.main'),
              },
            }),
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          slotProps: {
            inputLabel: {
              shrink: true,
            },
          },
        },
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              backgroundColor: v(theme, 'palette.action2.fieldBg'),
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              borderColor: v(theme, 'palette.action2.borderSubtle'),
            }),
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
        variants: [
          {
            props: { variant: 'filled' as const, severity: 'success' as const },
            style: ({ theme }: { theme: Theme }) => [
              {
                backgroundColor: v(theme, 'palette.brandFill.main'),
                color: v(theme, 'palette.brandFill.contrastText'),
                '& .MuiAlert-icon': { color: v(theme, 'palette.brandFill.contrastText') },
              },
              theme.applyStyles('dark', {
                border: `1px solid ${v(theme, 'palette.action2.borderSubtle')}`,
                boxShadow: 'var(--app-shadow-overlay)',
                '& .MuiAlert-icon': { color: v(theme, 'palette.success.main') },
              }),
            ],
          },
        ],
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'var(--mui-palette-divider)',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.applyStyles('dark', {
              color: v(theme, 'palette.connection.main'),
              '&:hover': {
                color: v(theme, 'palette.connection.light'),
              },
            }),
        },
      },
    },
  });
}
