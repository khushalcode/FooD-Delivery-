/**
 * Theme context — provides theme colors (light/dark) across the app,
 * mirrors the ThemeController in lib/common/controllers/theme_controller.dart.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, type ThemeColors } from './colors';
import { AppConstants } from './app_constants';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  // Load saved theme on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(AppConstants.themeKey);
        if (saved === 'dark' || saved === 'light') {
          setMode(saved);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    AsyncStorage.setItem(AppConstants.themeKey, next).catch(() => {});
  };

  const toggleTheme = () => setTheme(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: (mode === 'dark' ? COLORS.dark : COLORS.light) as ThemeColors,
      toggleTheme,
      setTheme,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
