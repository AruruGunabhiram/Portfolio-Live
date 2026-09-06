export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  /** @deprecated — use isDark or theme === 'dark' */
  isGeekMode: boolean;
  isTransitioning: boolean;
  transitionTarget: Theme | null;
}
