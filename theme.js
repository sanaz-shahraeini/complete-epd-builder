'use client';
import { Poppins } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

const theme = createTheme({
  palette: {
    mode: 'light',
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
  typography: {
    fontFamily: poppins.style.fontFamily,
    h6: {
      fontSize: '16px !important',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '18px !important',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '14px !important',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '13px !important',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontSize: '14px !important',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '15px !important',
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '14px !important',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: poppins.style.fontFamily,
        },
        h6: {
          fontSize: '16px !important',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
});

export default theme;