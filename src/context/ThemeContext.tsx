/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeContextType } from '../types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') as Theme;
    return savedTheme || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'geek');
    root.classList.add(theme);
    document.body.classList.remove('dark', 'geek');
    document.body.classList.add(theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'geek' : 'dark'));
  };

  const isGeekMode = theme === 'geek';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isGeekMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
