/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type PortfolioMode = 'standard' | 'recruiter';

interface PortfolioModeContextType {
  mode: PortfolioMode;
  isRecruiter: boolean;
  toggleMode: () => void;
  setMode: (m: PortfolioMode) => void;
}

const PortfolioModeContext = createContext<PortfolioModeContextType | undefined>(undefined);

function getModeFromUrl(): PortfolioMode | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get('mode');
  if (v === 'recruiter') return 'recruiter';
  if (v === 'standard') return 'standard';
  if (v !== null) return 'standard'; // invalid → standard
  return null;
}

function getInitialMode(): PortfolioMode {
  const fromUrl = getModeFromUrl();
  if (fromUrl) return fromUrl;
  return 'standard';
}

export const PortfolioModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeInternal] = useState<PortfolioMode>(() => getInitialMode());

  const applyUrl = useCallback((next: PortfolioMode) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (next === 'recruiter') url.searchParams.set('mode', 'recruiter');
    else url.searchParams.delete('mode');
    // preserve hash, pathname, other params
    window.history.replaceState(null, '', url.toString());
  }, []);

  const setMode = useCallback(
    (next: PortfolioMode) => {
      setModeInternal(next);
      applyUrl(next);
    },
    [applyUrl]
  );

  const toggleMode = useCallback(() => {
    setModeInternal(prev => {
      const next: PortfolioMode = prev === 'recruiter' ? 'standard' : 'recruiter';
      applyUrl(next);
      return next;
    });
  }, [applyUrl]);

  // handle browser back/forward and external direct links
  useEffect(() => {
    const onPopState = () => {
      const m = getModeFromUrl();
      if (m) setModeInternal(m);
      else setModeInternal('standard');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // keep focus on toggle control (no auto scroll/top)
  const isRecruiter = mode === 'recruiter';

  return (
    <PortfolioModeContext.Provider value={{ mode, isRecruiter, toggleMode, setMode }}>
      {children}
    </PortfolioModeContext.Provider>
  );
};

export const usePortfolioMode = (): PortfolioModeContextType => {
  const ctx = useContext(PortfolioModeContext);
  if (!ctx) throw new Error('usePortfolioMode must be used within PortfolioModeProvider');
  return ctx;
};
