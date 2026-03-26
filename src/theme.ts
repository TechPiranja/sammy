import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#6ee7ff',
    },
    secondary: {
      main: '#a855f7',
    },
    background: {
      default: '#05060b',
      paper: 'rgba(255,255,255,0.04)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cdd7e4',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(135deg, rgba(110, 231, 255, 0.08), rgba(168, 85, 247, 0.08))',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})
