import { useState } from 'react';
import { Container, Button } from '../components';
import { useTheme } from '../hooks';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isGeekMode } = useTheme();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 ${isGeekMode ? 'bg-geek-bg border-b border-geek-accent' : 'bg-dark-bg/95 backdrop-blur-sm border-b border-gray-800'}`}>
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className={`text-xl font-bold ${isGeekMode ? 'text-geek-accent' : 'text-dark-accent'}`}
          >
            {isGeekMode ? '> Portfolio_' : 'Portfolio'}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`${isGeekMode ? 'text-geek-text hover:text-geek-accent' : 'text-gray-300 hover:text-dark-accent'} transition-colors`}
              >
                {isGeekMode ? `> ${link.label}` : link.label}
              </button>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="text-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙 Dark' : '💻 Geek'}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              <div className="space-y-1">
                <span className={`block w-6 h-0.5 ${isGeekMode ? 'bg-geek-accent' : 'bg-gray-300'}`}></span>
                <span className={`block w-6 h-0.5 ${isGeekMode ? 'bg-geek-accent' : 'bg-gray-300'}`}></span>
                <span className={`block w-6 h-0.5 ${isGeekMode ? 'bg-geek-accent' : 'bg-gray-300'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left py-2 ${isGeekMode ? 'text-geek-text hover:text-geek-accent' : 'text-gray-300 hover:text-dark-accent'} transition-colors`}
              >
                {isGeekMode ? `> ${link.label}` : link.label}
              </button>
            ))}
          </nav>
        )}
      </Container>
    </header>
  );
};
