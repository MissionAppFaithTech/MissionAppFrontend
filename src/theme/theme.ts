import { createTheme, type ThemeOptions } from "@mui/material/styles";

/** UI color tokens */
export const colors = {
  primary: "#0D2B5C",
  secondary: "#F97316",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",

  background: "#F7F9FC",
  surface: "#FFFFFF",

  textPrimary: "#081C3A",
  textSecondary: "#6B7280",

  border: "#D1D5DB",
} as const;

export const roleColors = {
  missionary: "#0D2B5C",
  supporter: "#6BA6FF",
  intermediate: "#2563EB",
  mission: "#F97316",
} as const;

/** Derived shades for MUI palette variants */
const shades = {
  primaryLight: "#1A3D6E",
  supporterLight: "#93C5FD",
  supporterDark: "#4F8FE6",
  intermediateLight: "#3B82F6",
  intermediateDark: "#1D4ED8",
  missionLight: "#FB923C",
  missionDark: "#EA580C",
  surfaceMuted: "#EAF1FA",
} as const;

export const brandGradient =
  `linear-gradient(135deg, ${roleColors.missionary} 0%, ${roleColors.intermediate} 100%)`;

declare module "@mui/material/styles" {
  interface Palette {
    connection: Palette["primary"];
    supporter: Palette["primary"];
    mission: Palette["primary"];
    surface: Palette["primary"];
  }
  interface PaletteOptions {
    connection?: PaletteOptions["primary"];
    supporter?: PaletteOptions["primary"];
    mission?: PaletteOptions["primary"];
    surface?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    connection: true;
    supporter: true;
    mission: true;
  }
}

const fontFamily = 'var(--font-dm-sans), "DM Sans", sans-serif';

function createTypography(): ThemeOptions["typography"] {
  return {
    fontFamily,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    fontSize: 16,
    h1: {
      fontWeight: 700,
      lineHeight: 1.15,
      fontSize: "2rem",
      "@media (min-width:600px)": { fontSize: "2.5rem" },
      "@media (min-width:900px)": { fontSize: "3rem" },
      "@media (min-width:1200px)": { fontSize: "3.5rem" },
    },
    h2: {
      fontWeight: 700,
      lineHeight: 1.2,
      fontSize: "2rem",
      "@media (min-width:900px)": { fontSize: "2.25rem" },
      "@media (min-width:1200px)": { fontSize: "2.5rem" },
    },
    h3: {
      fontWeight: 600,
      lineHeight: 1.25,
      fontSize: "1.75rem",
      "@media (min-width:900px)": { fontSize: "2rem" },
    },
    h4: {
      fontWeight: 600,
      lineHeight: 1.3,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.35,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.4,
      fontSize: "1.125rem",
    },
    subtitle1: {
      fontWeight: 400,
      lineHeight: 1.75,
      fontSize: "1rem",
      "@media (min-width:900px)": { fontSize: "1.125rem" },
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: "1.1rem",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.7,
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    overline: {
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontSize: "0.75rem",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: "0.9375rem",
      textTransform: "none",
    },
  };
}

const extendedPalette = {
  primary: {
    main: colors.primary,
    light: shades.primaryLight,
    dark: colors.textPrimary,
    contrastText: colors.surface,
  },
  secondary: {
    main: colors.secondary,
    light: shades.missionLight,
    dark: shades.missionDark,
    contrastText: colors.surface,
  },
  connection: {
    main: roleColors.intermediate,
    light: shades.intermediateLight,
    dark: shades.intermediateDark,
    contrastText: colors.surface,
  },
  supporter: {
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
  surface: {
    main: shades.surfaceMuted,
    light: colors.surface,
    dark: "#D5E4F4",
    contrastText: roleColors.missionary,
  },
  success: {
    main: colors.success,
  },
  warning: {
    main: colors.warning,
  },
  error: {
    main: colors.error,
  },
};

export function createAppTheme(mode: "light" | "dark") {
  const isLight = mode === "light";

  /** Em fundo escuro o navy some — CTAs usam laranja da marca. */
  const darkFieldBg = "rgba(255, 255, 255, 0.06)";
  const darkFieldBorder = "rgba(107, 166, 255, 0.35)";
  const darkFieldBorderHover = "rgba(107, 166, 255, 0.55)";
  const darkFieldBorderFocus = roleColors.supporter;

  return createTheme({
    palette: {
      mode,
      ...extendedPalette,
      ...(isLight
        ? {}
        : {
            primary: {
              main: roleColors.supporter,
              light: shades.supporterLight,
              dark: shades.supporterDark,
              contrastText: colors.textPrimary,
            },
          }),
      background: {
        default: isLight ? colors.background : colors.textPrimary,
        paper: isLight ? colors.surface : shades.primaryLight,
      },
      text: {
        primary: isLight ? colors.textPrimary : colors.surface,
        secondary: isLight ? colors.textSecondary : "#94A3B8",
      },
      divider: isLight
        ? `${colors.border}33`
        : "rgba(107, 166, 255, 0.15)",
    },
    typography: createTypography(),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? colors.background : colors.textPrimary,
            color: isLight ? colors.textPrimary : colors.surface,
          },
          a: {
            color: isLight ? roleColors.intermediate : roleColors.supporter,
            "&:hover": {
              color: isLight ? shades.intermediateDark : shades.supporterLight,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: "small",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 4,
          },
        },
        variants: [
          ...(isLight
            ? []
            : [
                {
                  props: { color: "primary" as const, variant: "contained" as const },
                  style: {
                    backgroundColor: roleColors.mission,
                    color: colors.surface,
                    "&:hover": {
                      backgroundColor: shades.missionDark,
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(249, 115, 22, 0.35)",
                      color: "rgba(255, 255, 255, 0.55)",
                    },
                  },
                },
                {
                  props: { color: "primary" as const, variant: "text" as const },
                  style: {
                    color: roleColors.supporter,
                    "&:hover": {
                      backgroundColor: "rgba(107, 166, 255, 0.12)",
                    },
                  },
                },
              ]),
          {
            props: { color: "secondary", variant: "contained" },
            style: {
              "&:hover": {
                backgroundColor: roleColors.intermediate,
                color: colors.surface,
              },
            },
          },
          {
            props: { color: "primary", variant: "outlined" },
            style: isLight
              ? {
                  borderColor: colors.primary,
                  color: colors.primary,
                  "&:hover": {
                    borderColor: roleColors.intermediate,
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                  },
                }
              : {
                  borderColor: darkFieldBorder,
                  color: colors.surface,
                  "&:hover": {
                    borderColor: darkFieldBorderHover,
                    backgroundColor: "rgba(107, 166, 255, 0.1)",
                  },
                },
          },
          {
            props: { color: "supporter", variant: "contained" },
            style: {
              backgroundColor: roleColors.supporter,
              color: roleColors.missionary,
              "&:hover": {
                backgroundColor: roleColors.intermediate,
                color: colors.surface,
              },
            },
          },
          {
            props: { color: "mission", variant: "contained" },
            style: {
              backgroundColor: roleColors.mission,
              color: colors.surface,
              "&:hover": {
                backgroundColor: roleColors.intermediate,
              },
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              color: roleColors.intermediate,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: isLight
            ? undefined
            : {
                backgroundColor: darkFieldBg,
                color: colors.surface,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkFieldBorder,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkFieldBorderHover,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkFieldBorderFocus,
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                },
              },
          input: isLight
            ? undefined
            : {
                color: colors.surface,
                "&::placeholder": {
                  color: "#94A3B8",
                  opacity: 1,
                },
              },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: isLight
            ? undefined
            : {
                color: "#94A3B8",
                "&.Mui-focused": {
                  color: roleColors.supporter,
                },
                "&.Mui-error": {
                  color: colors.error,
                },
              },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: isLight
            ? undefined
            : {
                color: "#94A3B8",
              },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          slotProps: {
            inputLabel: {
              shrink: true,
            },
          },
        },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: isLight ? shades.surfaceMuted : darkFieldBg,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: isLight
            ? undefined
            : {
                borderColor: "rgba(107, 166, 255, 0.22)",
              },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: isLight
            ? undefined
            : {
                color: roleColors.supporter,
              },
        },
      },
    },
  });
}
