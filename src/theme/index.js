import { alpha, createTheme } from "@mui/material";
import { lightPalette, darkPalette } from "./palette";
import typography from "./typography";

export function createAppTheme(isDarkMode) {
  const palette = isDarkMode ? darkPalette : lightPalette;

  return createTheme({
    palette,
    typography,
    spacing: 8,
    shape: {
      borderRadius: 14,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: `radial-gradient(circle at 20% 0%, ${alpha(
              palette.primary.main,
              palette.mode === "dark" ? 0.14 : 0.08,
            )} 0%, transparent 45%)`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${alpha(palette.text.primary, 0.08)}`,
            boxShadow: `0 8px 24px ${alpha("#000000", palette.mode === "dark" ? 0.3 : 0.08)}`,
            transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: "medium",
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 12,
            paddingInline: 16,
          },
          contained: {
            boxShadow: `0 8px 18px ${alpha(palette.primary.main, 0.24)}`,
            "&:hover": {
              boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.3)}`,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          variant: "outlined",
          fullWidth: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: alpha(palette.background.paper, palette.mode === "dark" ? 0.35 : 0.92),
            transition: "all 160ms ease",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.text.primary, 0.14),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.primary.main, 0.35),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main,
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            minHeight: 44,
            fontWeight: 600,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 68,
            borderRadius: 18,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: "auto",
            paddingTop: 8,
            transition: "all 160ms ease",
          },
          label: {
            fontSize: "0.72rem",
            "&.Mui-selected": {
              fontSize: "0.75rem",
              fontWeight: 700,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
          },
        },
      },
    },
  });
}
