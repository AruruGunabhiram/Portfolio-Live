import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { CustomCursor, ParticleNetwork } from './components';
import { useKonamiCode, MatrixRain, HiddenTerminal, HackerTyper } from './components/easter-eggs';
import { useTheme } from './hooks';
import { prefersReducedMotion } from './utils';

function AppContent() {
  const { isGeekMode } = useTheme();
  const location = useLocation();
  const [showMatrix, setShowMatrix] = useState(false);
  const [showHackerTyper, setShowHackerTyper] = useState(false);

  // Konami code easter egg - triggers matrix rain
  useKonamiCode(() => {
    if (isGeekMode) {
      setShowMatrix(true);
    }
  });

  const reducedMotion = prefersReducedMotion();

  // Page transition variants
  const pageVariants = {
    initial: reducedMotion ? {} : {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: reducedMotion ? {} : {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: reducedMotion ? 0 : 0.5,
  };

  return (
    <>
      {/* Custom cursor - only in geek mode */}
      {isGeekMode && <CustomCursor />}

      {/* Hidden Terminal - Ctrl + ` to open */}
      {isGeekMode && <HiddenTerminal />}

      {/* Matrix Rain Easter Egg */}
      {showMatrix && (
        <MatrixRain
          onComplete={() => setShowMatrix(false)}
          duration={5000}
        />
      )}

      {/* Hacker Typer Effect */}
      {showHackerTyper && (
        <HackerTyper
          isActive={showHackerTyper}
          onComplete={() => setShowHackerTyper(false)}
        />
      )}

      <div className="min-h-screen flex flex-col relative">
        {/* Particle network background - always active in both themes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <ParticleNetwork />
        </div>

        <Header />

        {/* Animated page transitions */}
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
