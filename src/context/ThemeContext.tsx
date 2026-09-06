/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeContextType } from '../types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('portfolio-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Migrate legacy 'geek' -> 'dark'
    if (saved === ('geek' as unknown as Theme)) return 'dark';
  } catch {
    // ignore
  }
  return getSystemTheme();
}

function checkReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<Theme | null>(null);

  // Apply to <html> as data-theme — inline script already set it before paint; keep in sync.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    // Also sync body class for any legacy selectors (will be removed later)
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    if (checkReducedMotion()) {
      setTheme(next);
      return;
    }

    // Subtle transition: CSS handles bg/text 220ms; JS just flips with a brief overlay guard
    setTransitionTarget(next);
    setIsTransitioning(true);
    // Apply next theme quickly — let CSS transition do the blending (150-220ms)
    setTheme(next);
    window.setTimeout(() => {
      setIsTransitioning(false);
      setTransitionTarget(null);
    }, 260);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark,
        isGeekMode: isDark,
        isTransitioning,
        transitionTarget,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
