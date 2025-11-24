import { createTheme } from '@mui/material/styles';

// Chrome Extension Color Palette
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo accent - professional and modern
      light: '#7c7fee',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f97316', // Warm accent for secondary elements
      light: '#fb923c',
      dark: '#ea580c',
      contrastText: '#1f2933',
    },
    background: {
      default: '#f5f5f7', // Main background - soft light gray
      paper: '#ffffff', // Cards, panels, elevated surfaces
    },
    text: {
      primary: '#111827', // Main text
      secondary: '#4b5563', // Secondary text - labels, hints
      disabled: '#9ca3af',
    },
    success: {
      main: '#10b981',
      light: '#6ee7b7',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '6px 16px',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: '#4f46e5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4f46e5',
              borderWidth: '1.5px',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#111827',
            '&::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: '#e5e7eb',
          borderRadius: 8,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#4b5563',
          borderColor: '#cbd5f5',
          '&.Mui-selected': {
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#4338ca',
            },
          },
          '&:hover': {
            backgroundColor: '#ede9fe',
            color: '#1f2937',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#4338ca',
            color: '#ffffff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
        },
      },
    },
  },
});

