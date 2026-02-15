import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { CustomCursor, ParticleNetwork } from './components';
import { useTheme } from './hooks';

function AppContent() {
  const { isGeekMode } = useTheme();

  return (
    <>
      {/* Custom cursor - only in geek mode */}
      {isGeekMode && <CustomCursor />}

      <div className="min-h-screen flex flex-col relative">
        {/* Particle network background - only in geek mode */}
        {isGeekMode && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <ParticleNetwork />
          </div>
        )}

        <Header />
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
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
