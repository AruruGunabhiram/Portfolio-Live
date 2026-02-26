import { useState } from 'react';
import { Container, Button, AnimatedLogo } from '../components';
import { useTheme } from '../hooks';
import { CONTACT } from '../data/resume';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme, isGeekMode, isTransitioning } = useTheme();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  const navClass = isGeekMode
    ? 'text-[#5ba8c4] hover:text-[#7ec0d6] transition-colors'
    : 'text-gray-400 hover:text-white transition-colors';

  return (
    <header
      className={`sticky top-0 z-50 ${
        isGeekMode
          ? 'bg-[#080c1a]/95 backdrop-blur-sm border-b border-[#2a5060]/40'
          : 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800/60'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-14">
          {/* Logo / name */}
          <button
            onClick={() => scrollToSection('hero')}
            className={`flex items-center gap-2 text-sm font-semibold ${
              isGeekMode ? 'text-[#7ec0d6]' : 'text-white'
            }`}
          >
            {isGeekMode && <AnimatedLogo className="text-[#5ba8c4]" />}
            {isGeekMode ? `> ${CONTACT.nameShort}_` : CONTACT.nameShort}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} className={navClass}>
                {isGeekMode ? `> ${link.label}` : link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle — disabled during transition to prevent double-click */}
            <Button
              variant="ghost"
              onClick={toggleTheme}
              disabled={isTransitioning}
              className={`text-xs px-2 py-1 transition-opacity ${isTransitioning ? 'opacity-40 cursor-not-allowed' : ''}`}
              aria-label={`Switch to ${theme === 'dark' ? 'geek' : 'dark'} mode`}
            >
              {theme === 'dark' ? '🌙 Dark' : '💻 Geek'}
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="space-y-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className={`block w-5 h-0.5 ${isGeekMode ? 'bg-[#5ba8c4]' : 'bg-gray-400'}`} />
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-800/40 space-y-0.5">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left px-2 py-2 text-sm rounded ${navClass}`}
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
