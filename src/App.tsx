import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { Header, Footer } from './sections';
import { Home } from './pages';

function App() {
  return (
    <BrowserRouter>
      <ParallaxProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ParallaxProvider>
    </BrowserRouter>
  );
}

export default App;
