import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { SpaceDustBackground } from './components';
import { LoaderOverlay } from './components/LoaderOverlay';
import { usePageLoading } from './hooks/usePageLoading';
import { prefersReducedMotion } from './utils';

function AppContent() {
  const location = useLocation();
  const [showMatrix] = useState(false);

  const { isLoading, setLoading } = usePageLoading(0, 900, true);

  useEffect(() => {
    const hasRIC = typeof window !== 'undefined' && 'requestIdleCallback' in window;
    const id = hasRIC
      ? (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => setLoading(false),
          { timeout: 2000 }
        )
      : (setTimeout(() => setLoading(false), 400) as unknown as number);
    return () => {
      if (hasRIC) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id as number);
      } else {
        clearTimeout(id as ReturnType<typeof setTimeout>);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reducedMotion = prefersReducedMotion();

  const pageVariants = {
    initial: reducedMotion ? {} : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reducedMotion ? {} : { opacity: 0, y: -8 },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'easeOut' as const,
    duration: reducedMotion ? 0 : 0.3,
  };

  void showMatrix;

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />

      <div className="min-h-screen flex flex-col relative">
        <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.55 }}>
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
