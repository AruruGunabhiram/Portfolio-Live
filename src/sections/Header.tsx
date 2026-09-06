import { useState } from 'react';
import { Container, Button } from '../components';
import { useTheme } from '../hooks';
import { PROFILE } from '../data/profile';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'practices', label: 'Practices' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderColor: 'var(--border)',
      }}
    >
      <Container>
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            {PROFILE.shortName}
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md !px-2 !py-1"
            >
              {theme === 'dark' ? (
                // moon
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                // sun
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v1.5M12 20.5V22M4.93 4.93l1.06 1.06M17.66 17.66l1.06 1.06M2 12h1.5M20.5 12H22M4.93 19.07l1.06-1.06M17.66 6.34l1.06-1.06" />
                </svg>
              )}
            </Button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              style={{ color: 'var(--text)' }}
            >
              <div className="space-y-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="block w-5 h-0.5" style={{ background: 'var(--text-muted)' }} />
                ))}
              </div>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-3 space-y-0.5 border-t" style={{ borderColor: 'var(--border)' }}>
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left px-2 py-2 text-sm rounded transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
      </Container>
    </header>
  );
};
