import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { CustomCursor, SpaceDustBackground } from './components';
import { LoaderOverlay } from './components/LoaderOverlay';
import { useKonamiCode, MatrixRain, HiddenTerminal, HackerTyper } from './components/easter-eggs';
import { useTheme } from './hooks';
import { usePageLoading } from './hooks/usePageLoading';
import { prefersReducedMotion } from './utils';

// Theme transition scanline overlay
function ThemeTransitionOverlay() {
  const { isTransitioning, transitionTarget } = useTheme();
  const reduced = prefersReducedMotion();

  if (reduced) return null;

  const bgColor = transitionTarget === 'geek' ? '#080c1a' : '#090910';

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="theme-transition"
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            pointerEvents: 'none',
            backgroundColor: bgColor,
          }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{
            clipPath: [
              'inset(0 0 100% 0)',
              'inset(0 0 0% 0)',
              'inset(0 0 0% 0)',
              'inset(100% 0 0% 0)',
            ],
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.44, 0.56, 1],
          }}
        />
      )}
    </AnimatePresence>
  );
}

function AppContent() {
  const { isGeekMode } = useTheme();
  const location = useLocation();
  const [showMatrix, setShowMatrix] = useState(false);
  const [showHackerTyper, setShowHackerTyper] = useState(false);
  const { isLoading, setLoading } = usePageLoading(120, 380);

  // Initial app load
  useEffect(() => {
    setLoading(true);
    // Mark ready once React has hydrated (fonts + first paint)
    const hasRIC = typeof window !== 'undefined' && 'requestIdleCallback' in window;
    const id = hasRIC
      ? (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback(() => setLoading(false), { timeout: 2000 })
      : setTimeout(() => setLoading(false), 400) as unknown as number;
    return () => {
      if (hasRIC) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useKonamiCode(() => {
    if (isGeekMode) setShowMatrix(true);
  });

  const reducedMotion = prefersReducedMotion();

  const pageVariants = {
    initial: reducedMotion ? {} : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: reducedMotion ? {} : { opacity: 0, y: -10 },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: reducedMotion ? 0 : 0.45,
  };

  return (
    <>
      {/* Premium initial load overlay */}
      <LoaderOverlay isLoading={isLoading} />

      {/* Scanline theme transition overlay */}
      <ThemeTransitionOverlay />

      {/* Custom cursor — geek mode only */}
      {isGeekMode && <CustomCursor />}

      {/* Easter eggs */}
      {isGeekMode && <HiddenTerminal />}
      {showMatrix && (
        <MatrixRain onComplete={() => setShowMatrix(false)} duration={5000} />
      )}
      {showHackerTyper && (
        <HackerTyper
          isActive={showHackerTyper}
          onComplete={() => setShowHackerTyper(false)}
        />
      )}

      <div className="min-h-screen flex flex-col relative">
        {/* Space-dust background — always active, Canvas2D, no tsParticles */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <SpaceDustBackground />
        </div>

        <Header />

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex-1 relative z-10"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
            </Routes>
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ParallaxProvider>
        <AppContent />
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;
