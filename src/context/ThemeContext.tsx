/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeContextType } from '../types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

function checkReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme') as Theme;
      return saved === 'dark' || saved === 'geek' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<Theme | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'geek');
    root.classList.add(theme);
    document.body.classList.remove('dark', 'geek');
    document.body.classList.add(theme);
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* noop */ }
  }, [theme]);

  useEffect(() => {
    return () => { timerRefs.current.forEach(clearTimeout); };
  }, []);

  const toggleTheme = useCallback((_rect?: DOMRect) => {
    if (isTransitioning) return;
    const next: Theme = theme === 'dark' ? 'geek' : 'dark';

    if (checkReducedMotion()) {
      setTheme(next);
      return;
    }

    setTransitionTarget(next);
    setIsTransitioning(true);

    // Swap theme at 380ms — overlay is fully opaque by then (fade-in: 300ms),
    // so the CSS variable swap is invisible.
    const t1 = setTimeout(() => setTheme(next), 380);
    // Release overlay at 950ms — AnimatePresence plays exit fade-out (450ms).
    const t2 = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionTarget(null);
    }, 950);

    timerRefs.current = [t1, t2];
  }, [theme, isTransitioning]);

  const isGeekMode = theme === 'geek';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isGeekMode, isTransitioning, transitionTarget }}>
      {children}
    </ThemeContext.Provider>
  );
};
