import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSetting, upsertSetting } from '../lib/supabaseSettings';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('neurostock_theme');
  if (stored === 'dark' || stored === 'light' || stored === 'auto') {
    return stored;
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const effectiveTheme = theme === 'auto' ? systemTheme : theme;
  const isDark = effectiveTheme === 'dark';

  // Load theme from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      try {
        const remote = await fetchSetting('app_theme');
        const remoteTheme =
          remote === 'dark' || remote === 'light' || remote === 'auto'
            ? (remote as Theme)
            : null;

        const localTheme = getStoredTheme();
        const finalTheme = remoteTheme ?? localTheme;

        if (!cancelled) {
          setThemeState(finalTheme);
          setIsThemeLoaded(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem('neurostock_theme', finalTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        if (!cancelled) {
          setIsThemeLoaded(true);
        }
      }
    }

    loadTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isThemeLoaded) return;

    const root = document.documentElement;
    const body = document.body;

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', effectiveTheme === 'dark' ? '#0f0e0d' : '#f5f3ee');
    }
  }, [effectiveTheme, isThemeLoaded]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof window !== 'undefined') {
      localStorage.setItem('neurostock_theme', newTheme);
    }

    // Sync to Supabase
    upsertSetting('app_theme', newTheme).catch((error) => {
      console.error('Error saving theme to Supabase:', error);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
