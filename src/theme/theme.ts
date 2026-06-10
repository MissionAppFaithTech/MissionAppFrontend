import { createTheme, type ThemeOptions } from "@mui/material/styles";

/** Official MISSION APP brand tokens */
export const brandColors = {
  missionary: "#0D2B5C",
  missionaryDark: "#081C3A",
  missionaryLight: "#1A3D6E",
  supporter: "#6BA6FF",
  supporterDark: "#4F8FE6",
  supporterLight: "#93C5FD",
  mission: "#F97316",
  missionDark: "#EA580C",
  missionLight: "#FB923C",
  intermediate: "#2563EB",
  intermediateDark: "#1D4ED8",
  intermediateLight: "#3B82F6",
  surfaceLight: "#EAF1FA",
  backgroundLight: "#F7F9FC",
  backgroundDark: "#081C3A",
  white: "#FFFFFF",
  grayMedium: "#6B7280",
  grayDark: "#374151",
} as const;

export const brandGradient =
  "linear-gradient(135deg, #0D2B5C 0%, #2563EB 100%)";

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
    main: brandColors.missionary,
    light: brandColors.missionaryLight,
    dark: brandColors.missionaryDark,
    contrastText: brandColors.white,
  },
  secondary: {
    main: brandColors.supporter,
    light: brandColors.supporterLight,
    dark: brandColors.supporterDark,
    contrastText: brandColors.missionary,
  },
  connection: {
    main: brandColors.intermediate,
    light: brandColors.intermediateLight,
    dark: brandColors.intermediateDark,
    contrastText: brandColors.white,
  },
  supporter: {
    main: brandColors.supporter,
    light: brandColors.supporterLight,
    dark: brandColors.supporterDark,
    contrastText: brandColors.missionary,
  },
  mission: {
    main: brandColors.mission,
    light: brandColors.missionLight,
    dark: brandColors.missionDark,
    contrastText: brandColors.white,
  },
  surface: {
    main: brandColors.surfaceLight,
    light: brandColors.white,
    dark: "#D5E4F4",
    contrastText: brandColors.missionary,
  },
};

export function createAppTheme(mode: "light" | "dark") {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      ...extendedPalette,
      background: {
        default: isLight
          ? brandColors.backgroundLight
          : brandColors.backgroundDark,
        paper: isLight ? brandColors.white : brandColors.missionaryDark,
      },
      text: {
        primary: isLight ? brandColors.missionary : brandColors.white,
        secondary: isLight ? brandColors.grayMedium : "#94A3B8",
      },
      divider: isLight
        ? "rgba(107, 114, 128, 0.2)"
        : "rgba(107, 166, 255, 0.15)",
    },
    typography: createTypography(),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight
              ? brandColors.backgroundLight
              : brandColors.backgroundDark,
            color: isLight ? brandColors.missionary : brandColors.white,
          },
          a: {
            color: brandColors.intermediate,
            "&:hover": {
              color: brandColors.intermediateDark,
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
          {
            props: { color: "secondary", variant: "contained" },
            style: {
              "&:hover": {
                backgroundColor: brandColors.intermediate,
                color: brandColors.white,
              },
            },
          },
          {
            props: { color: "primary", variant: "outlined" },
            style: {
              borderColor: brandColors.missionary,
              color: brandColors.missionary,
              "&:hover": {
                borderColor: brandColors.intermediate,
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              },
            },
          },
          {
            props: { color: "supporter", variant: "contained" },
            style: {
              backgroundColor: brandColors.supporter,
              color: brandColors.missionary,
              "&:hover": {
                backgroundColor: brandColors.intermediate,
                color: brandColors.white,
              },
            },
          },
          {
            props: { color: "mission", variant: "contained" },
            style: {
              backgroundColor: brandColors.mission,
              color: brandColors.white,
              "&:hover": {
                backgroundColor: brandColors.intermediate,
              },
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              color: brandColors.intermediate,
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
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: isLight ? brandColors.surfaceLight : undefined,
            },
          },
        },
      },
    },
  });
}
