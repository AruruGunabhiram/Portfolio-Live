export type Theme = 'dark' | 'geek';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isGeekMode: boolean;
  isTransitioning: boolean;
  transitionTarget: Theme | null;
}
