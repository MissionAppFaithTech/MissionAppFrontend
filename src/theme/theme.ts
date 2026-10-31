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

/** Product button corner — rounded rectangle, never a stadium / pill. */
export const BUTTON_BORDER_RADIUS = '10px';

/** Compact branded action size — shorter height, a bit more width. */
export const FORM_ACTION_BUTTON_SX = {
  minHeight: 44,
  minWidth: { xs: 0, sm: 108 },
  px: { xs: 2.5, sm: 3 },
  fontSize: { xs: '0.875rem', sm: '0.8125rem' },
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
  /** Resting input outline — >= 3:1 against the field and the surface (WCAG 1.4.11). */
  fieldBorder: string;
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
  /* 3.24:1 on the field wash, 3.69:1 on white */
  fieldBorder: '#7A8699',
  brandFill: colors.primary,
  brandFillText: colors.surface,
  avatarFill: shades.supporterLight,
  avatarText: '#000000',
};

export const darkTokens: ModeTokens = {
  /** Navy ground — the dark scheme from before the black experiment. */
  canvas: colors.textPrimary,
  surface1: shades.primaryLight,
  surface2: '#204878',
  borderSubtle: 'rgba(147, 197, 253, 0.18)',
  borderStrong: 'rgba(147, 197, 253, 0.35)',
  textPrimary: colors.surface,
  /* Slate-300 — ≥4.5:1 on paper (#1A3D6E) and field wash (#284977) */
  textSecondary: '#CBD5E1',
  textDisabled: 'rgba(255, 255, 255, 0.38)',
  actionFill: roleColors.mission,
  actionFillHover: shades.missionDark,
  actionFillActive: shades.missionDark,
  actionFillText: colors.surface,
  accent: '#FB923C',
  accentSoft: '#FED7AA',
  accentWash: 'rgba(194, 65, 12, 0.22)',
  link: shades.supporterLight,
  linkHover: '#BFDBFE',
  secondaryHoverWash: 'rgba(147, 197, 253, 0.12)',
  focusRing: '#60A5FA',
  disabledFill: 'rgba(255, 255, 255, 0.08)',
  disabledText: 'rgba(255, 255, 255, 0.55)',
  disabledBorder: 'rgba(147, 197, 253, 0.22)',
  /* Soft red — readable as text/icons on navy paper (WCAG AA) */
  danger: '#FCA5A5',
  dangerFill: colors.error,
  fieldBg: 'rgba(255, 255, 255, 0.06)',
  fieldBgDisabled: 'rgba(255, 255, 255, 0.03)',
  /* 3.23:1 on paper (#1A3D6E) */
  fieldBorder: 'rgba(147, 197, 253, 0.6)',
  brandFill: '#1E293B',
  brandFillText: colors.surface,
  avatarFill: colors.surface,
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
      linkHover: string;
      disabledFill: string;
      disabledText: string;
      disabledBorder: string;
      danger: string;
      dangerFill: string;
      surface2: string;
      fieldBg: string;
      fieldBgDisabled: string;
      fieldBorder: string;
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

/** `--app-font-family` is swapped by the readable-font preference (globals.css). */
const fontFamily = 'var(--app-font-family, var(--font-dm-sans)), "DM Sans", sans-serif';

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
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.35,
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
          main: shades.supporterLight,
          light: '#BFDBFE',
          dark: roleColors.intermediate,
          contrastText: colors.textPrimary,
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
          contrastText: colors.surface,
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
          /* Navy ink: white on #93C5FD was 1.80:1, navy is 9.41:1 */
          contrastText: colors.textPrimary,
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
          contrastText: roleColors.missionary,
        },
    mission: {
      main: roleColors.mission,
      light: shades.missionLight,
      dark: shades.missionDark,
      contrastText: colors.surface,
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
     * `accent.*` cannot shift the light theme. Dark uses a brighter orange so the
     * mark still reads on navy.
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
          dark: shades.missionLight,
          /* Navy ink: white on #FB923C was 2.26:1, navy is 7.5:1 */
          contrastText: colors.textPrimary,
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
          /* Dark ink on bright fill — white on #22C55E fails AA */
          contrastText: '#052e16',
        },
    warning: isLight
      ? { main: colors.warning, contrastText: colors.surface }
      : {
          main: '#FBBF24',
          light: '#FCD34D',
          dark: colors.warning,
          contrastText: '#422006',
        },
    error: isLight
      ? { main: colors.error, contrastText: colors.surface }
      : { main: t.danger, light: '#FECACA', dark: t.dangerFill, contrastText: '#450a0a' },
    info: isLight
      ? { main: roleColors.intermediate, contrastText: colors.surface }
      : { main: t.link, contrastText: '#0c1a32' },
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
      linkHover: t.linkHover,
      disabledFill: t.disabledFill,
      disabledText: t.disabledText,
      disabledBorder: t.disabledBorder,
      danger: t.danger,
      dangerFill: t.dangerFill,
      surface2: t.surface2,
      fieldBg: t.fieldBg,
      fieldBgDisabled: t.fieldBgDisabled,
      fieldBorder: t.fieldBorder,
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
            // Darker in light mode (#1D4ED8, 6.7:1) and lighter in dark mode, plus an
            // underline so hover never depends on color alone.
            '&:hover': {
              color: 'var(--mui-palette-action2-linkHover)',
              textDecoration: 'underline',
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
            borderRadius: BUTTON_BORDER_RADIUS,
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
                  boxShadow: 'none',
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
                  backgroundColor: v(theme, 'palette.mission.dark'),
                  boxShadow: 'none',
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
            {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.action2.fieldBorder'),
              },
            },
            theme.applyStyles('dark', {
              backgroundColor: v(theme, 'palette.action2.fieldBg'),
              color: v(theme, 'palette.text.primary'),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: v(theme, 'palette.action2.fieldBorder'),
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
          input: ({ theme }) => [
            {
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active':
                {
                  WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                  boxShadow: '0 0 0 1000px #ffffff inset !important',
                  WebkitTextFillColor: 'var(--mui-palette-text-primary, #081c3a) !important',
                  caretColor: 'var(--mui-palette-text-primary, #081c3a) !important',
                  transition: 'background-color 5000s ease-in-out 0s',
                  borderRadius: 'inherit',
                },
              '&::selection': {
                backgroundColor: 'rgba(249, 115, 22, 0.25) !important',
                color: 'inherit !important',
              },
            },
            theme.applyStyles('dark', {
              color: v(theme, 'palette.text.primary'),
              // The one text that stays dimmed. Body copy is white, but a
              // placeholder has to read as "not filled in yet" — at the same white
              // as a typed value it looks like the field already has content.
              '&::placeholder': {
                color: '#94A3B8',
                opacity: 1,
              },
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active':
                {
                  WebkitBoxShadow: '0 0 0 1000px #1a3d6e inset !important',
                  boxShadow: '0 0 0 1000px #1a3d6e inset !important',
                  WebkitTextFillColor: '#ffffff !important',
                  caretColor: '#ffffff !important',
                  transition: 'background-color 5000s ease-in-out 0s',
                  borderRadius: 'inherit',
                },
              '&::selection': {
                backgroundColor: 'rgba(249, 115, 22, 0.35) !important',
                color: '#ffffff !important',
              },
            }),
          ],
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
          root: ({ theme }) => ({
            fontSize: '0.75rem',
            lineHeight: 1.3,
            marginTop: 4,
            ...theme.applyStyles('dark', {
              color: v(theme, 'palette.text.secondary'),
              '&.Mui-error': {
                color: v(theme, 'palette.error.main'),
              },
            }),
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
          root: ({ theme }) => ({
            borderRadius: 10,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            padding: '12px 16px',
            alignItems: 'flex-start',
            '& .MuiAlert-icon': {
              fontSize: 22,
              marginRight: 12,
              padding: 0,
              opacity: 1,
            },
            '& .MuiAlert-message': {
              padding: 0,
              width: '100%',
              minWidth: 0,
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              color: '#991B1B',
              '& .MuiAlert-icon': {
                color: '#DC2626',
              },
              ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1.5px solid #F87171',
                color: '#FFFFFF',
                boxShadow: '0 0 14px rgba(239, 68, 68, 0.18)',
                '& .MuiAlert-icon': {
                  color: '#F87171',
                },
                '& .MuiAlert-message, & .MuiTypography-root': {
                  color: 'inherit',
                },
              }),
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              color: '#92400E',
              '& .MuiAlert-icon': {
                color: '#D97706',
              },
              ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                border: '1.5px solid #FBBF24',
                // Text token, not white: AuthCard keeps a light surface in dark mode and
                // remaps --mui-palette-text-primary, so alerts stay readable on both.
                color: 'var(--mui-palette-text-primary)',
                '& .MuiAlert-icon': {
                  color: '#FBBF24',
                },
                '& .MuiAlert-message, & .MuiTypography-root': {
                  color: 'inherit',
                },
              }),
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              color: '#1E40AF',
              '& .MuiAlert-icon': {
                color: '#2563EB',
              },
              ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(59, 130, 246, 0.18)',
                border: '1.5px solid #60A5FA',
                // Text token, not white: AuthCard keeps a light surface in dark mode and
                // remaps --mui-palette-text-primary, so alerts stay readable on both.
                color: 'var(--mui-palette-text-primary)',
                '& .MuiAlert-icon': {
                  color: '#60A5FA',
                },
                '& .MuiAlert-message, & .MuiTypography-root': {
                  color: 'inherit',
                },
              }),
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              color: '#166534',
              '& .MuiAlert-icon': {
                color: '#16A34A',
              },
              ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(34, 197, 94, 0.18)',
                border: '1.5px solid #4ADE80',
                // Text token, not white: AuthCard keeps a light surface in dark mode and
                // remaps --mui-palette-text-primary, so alerts stay readable on both.
                color: 'var(--mui-palette-text-primary)',
                '& .MuiAlert-icon': {
                  color: '#4ADE80',
                },
                '& .MuiAlert-message, & .MuiTypography-root': {
                  color: 'inherit',
                },
              }),
            },
          }),
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
