'use client';

import { createTheme, type PaletteMode } from '@mui/material/styles';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#1B5E3B',
      light: '#4A9B6E',
      dark: '#0D3320',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00C853',
      light: '#5EE094',
      dark: '#009624',
      contrastText: '#FFFFFF',
    },
    background: {
      default: mode === 'light' ? '#F8FAF9' : '#0A0F0C',
      paper: mode === 'light' ? '#FFFFFF' : '#141E18',
    },
    text: {
      primary: mode === 'light' ? '#1A2E1F' : '#E8F5E9',
      secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
    },
    grey: {
      50: mode === 'light' ? '#F9FAFB' : '#1A2420',
      100: mode === 'light' ? '#F3F4F6' : '#1E2B24',
      200: mode === 'light' ? '#E5E7EB' : '#2D3B33',
      300: mode === 'light' ? '#D1D5DB' : '#3D4E44',
      400: mode === 'light' ? '#9CA3AF' : '#6B7A70',
      500: '#6B7280',
      600: mode === 'light' ? '#4B5563' : '#9CA3AF',
      700: mode === 'light' ? '#374151' : '#D1D5DB',
      800: mode === 'light' ? '#1F2937' : '#E5E7EB',
      900: mode === 'light' ? '#111827' : '#F3F4F6',
    },
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
    divider: mode === 'light' ? '#E5E7EB' : '#2D3B33',
  },
});

export function createAppTheme(mode: PaletteMode) {
  const designTokens = getDesignTokens(mode);

  return createTheme({
    ...designTokens,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.7,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #1B5E3B 0%, #4A9B6E 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0D3320 0%, #1B5E3B 100%)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #00C853 0%, #5EE094 100%)',
            color: '#0D3320',
            '&:hover': {
              background: 'linear-gradient(135deg, #009624 0%, #00C853 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === 'light'
                ? '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
                : '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${mode === 'light' ? '#F3F4F6' : '#2D3B33'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 10px 40px rgba(0, 0, 0, 0.08)'
                  : '0 10px 40px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              '& fieldset': {
                borderColor: mode === 'light' ? '#E5E7EB' : '#2D3B33',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#9CA3AF' : '#4A9B6E',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${mode === 'light' ? '#F3F4F6' : '#2D3B33'}`,
            backgroundColor:
              mode === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(10, 15, 12, 0.85)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#141E18',
          },
        },
      },
    },
  });
}
