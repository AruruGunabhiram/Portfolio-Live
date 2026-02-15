import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { Header, Footer } from './sections';
import { Home } from './pages';
import { CustomCursor } from './components';
import { useTheme } from './hooks';

function AppContent() {
  const { isGeekMode } = useTheme();

  return (
    <>
      {/* Custom cursor - only in geek mode */}
      {isGeekMode && <CustomCursor />}

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
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
