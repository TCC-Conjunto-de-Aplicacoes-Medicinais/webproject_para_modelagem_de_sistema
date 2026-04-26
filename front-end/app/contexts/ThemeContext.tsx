'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { PaletteMode } from '@mui/material/styles';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'clinicagen-theme-mode';

function getInitialMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(getInitialMode());
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  // Avoid hydration mismatch by rendering children only after mount
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode deve ser utilizado dentro de um ThemeModeProvider');
  }

  return context;
}
