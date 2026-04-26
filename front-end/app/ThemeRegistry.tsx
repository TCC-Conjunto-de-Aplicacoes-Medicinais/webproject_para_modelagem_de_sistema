'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createAppTheme } from './theme';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';

const CACHE_KEY = 'mui-emotion';

function createEmotionCache() {
  return createCache({ key: CACHE_KEY, prepend: true });
}

interface ThemeRegistryProps {
  children: ReactNode;
}

function ThemeRegistryInner({ children }: ThemeRegistryProps) {
  const { mode } = useThemeMode();
  const [emotionCache] = useState(createEmotionCache);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeModeProvider>
      <ThemeRegistryInner>{children}</ThemeRegistryInner>
    </ThemeModeProvider>
  );
}
