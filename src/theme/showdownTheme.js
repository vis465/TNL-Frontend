import { createTheme } from '@mui/material/styles';

/**
 * Scoped "fierce" Showdown theme — molten ember accents on deep charcoal.
 * Wrap Showdown routes with ThemeProvider using this theme.
 */
export function createShowdownTheme(baseMode = 'dark') {
  const isDark = baseMode !== 'light';
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#ff5722',
        dark: '#d84315',
        light: '#ff8a50',
        contrastText: '#0d0d0d',
      },
      secondary: {
        main: '#ffc107',
        contrastText: '#0d0d0d',
      },
      background: {
        default: isDark ? '#0a0a0c' : '#f5f5f5',
        paper: isDark ? '#141418' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f2f2f4' : '#121212',
        secondary: isDark ? 'rgba(242,242,244,0.65)' : 'rgba(0,0,0,0.6)',
      },
    },
    typography: {
      fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: isDark
              ? 'linear-gradient(145deg, rgba(255,87,34,0.06) 0%, transparent 45%)'
              : undefined,
          },
        },
      },
    },
  });
}

/**
 * Palette overrides merged into the main App theme when Showdown is live
 * and the user is logged in (see App.js).
 */
export function getShowdownGlobalPalette(isDarkMode) {
  const isDark = isDarkMode !== false;
  return {
    primary: {
      main: '#ff5722',
      light: '#ff8a50',
      dark: '#c41c00',
      contrastText: '#0d0d0d',
    },
    secondary: {
      main: '#ffc107',
      light: '#ffd54f',
      dark: '#c79100',
      contrastText: '#0d0d0d',
    },
    background: {
      default: isDark ? '#0a0a0c' : '#f5f5f5',
      paper: isDark ? '#141418' : '#ffffff',
    },
    text: {
      primary: isDark ? '#f2f2f4' : '#121212',
      secondary: isDark ? 'rgba(242,242,244,0.65)' : 'rgba(0,0,0,0.6)',
    },
  };
}

export function applyShowdownCssVars(rootEl) {
  if (!rootEl || typeof document === 'undefined') return;
  const el = rootEl;
  el.style.setProperty('--showdown-bg-deep', '#0a0a0c');
  el.style.setProperty('--showdown-surface', '#141418');
  el.style.setProperty('--showdown-accent-hot', '#ff5722');
  el.style.setProperty('--showdown-accent-warn', '#ffc107');
  el.style.setProperty('--showdown-text-primary', '#f2f2f4');
  el.style.setProperty('--showdown-muted', 'rgba(242,242,244,0.65)');
}
