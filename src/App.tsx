import { useState, useEffect, useRef } from 'react';
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

// ─── Theme transition: GPU-composited opacity overlay ─────────────────────────
// Uses opacity only (no clip-path) so the browser can promote to a compositor
// layer and avoid per-frame layout/paint work entirely.
function ThemeTransitionOverlay() {
  const { isTransitioning, transitionTarget } = useTheme();
  // Capture the background colour while transitionTarget is still set,
  // so the exit-fade uses the same colour rather than flashing on null.
  const bgRef = useRef<string>('#090910');
  if (transitionTarget !== null) {
    bgRef.current = transitionTarget === 'geek' ? '#071220' : '#090910';
  }

  if (prefersReducedMotion()) return null;

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
            backgroundColor: bgRef.current,
            willChange: 'opacity',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, ease: 'easeIn' } }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
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

  // startVisible=true → loader shows from frame 1; minDisplay 2200ms = intentional intro
  const { isLoading, setLoading } = usePageLoading(0, 2200, true);

  // Signal "app ready" once browser is idle — the 2200ms minimum keeps loader up
  useEffect(() => {
    const hasRIC = typeof window !== 'undefined' && 'requestIdleCallback' in window;
    const id = hasRIC
      ? (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback(() => setLoading(false), { timeout: 3000 })
      : setTimeout(() => setLoading(false), 600) as unknown as number;
    return () => {
      if (hasRIC) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
          id as number,
        );
      } else {
        clearTimeout(id as ReturnType<typeof setTimeout>);
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
      {/* Premium initial load overlay — always 2.2s+ */}
      <LoaderOverlay isLoading={isLoading} />

      {/* Button-origin expanding portal theme transition */}
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
        {/* Space-dust background — always active, Canvas2D */}
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
