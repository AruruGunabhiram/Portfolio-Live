import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { SpaceDustBackground } from './components';
import { LoaderOverlay } from './components/LoaderOverlay';
import { useSessionLoader } from './hooks/useSessionLoader';
import { prefersReducedMotion } from './utils';
import { PortfolioModeProvider, usePortfolioMode } from './context/PortfolioModeContext';

function AppContent() {
  const location = useLocation();
  const { isLoading, shouldRender } = useSessionLoader();
  const reducedMotion = prefersReducedMotion();
  const { isRecruiter } = usePortfolioMode();

  const pageVariants = {
    initial: reducedMotion ? {} : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reducedMotion ? {} : { opacity: 0, y: -6 },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'easeOut' as const,
    duration: reducedMotion ? 0 : 0.22,
  };

  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('main-content');
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      // ensure hash updates for history
      history.replaceState(null, '', '#main-content');
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link" onClick={handleSkip}>
        Skip to main content
      </a>

      <LoaderOverlay isLoading={isLoading} shouldRender={shouldRender} />

      <div className="min-h-screen flex flex-col relative" aria-busy={isLoading || undefined}>
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ opacity: isRecruiter ? 0.18 : 0.5, transition: 'opacity 220ms ease' }}
          aria-hidden="true"
        >
          <SpaceDustBackground />
        </div>

        <Header />

        <AnimatePresence mode="wait">
          <motion.main
            id="main-content"
            tabIndex={-1}
            key={location.pathname}
            className="flex-1 relative z-10 outline-none"
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
      <PortfolioModeProvider>
        <ParallaxProvider>
          <AppContent />
        </ParallaxProvider>
      </PortfolioModeProvider>
    </BrowserRouter>
  );
}

export default App;
