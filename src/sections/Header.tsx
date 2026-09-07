import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Button } from '../components';
import { useTheme } from '../hooks';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { PROFILE } from '../data/profile';
import { prefersReducedMotion } from '../utils';

type NavItem = { id: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'publications', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'contact', label: 'Contact' },
];

const RECRUITER_NAV_ITEMS: NavItem[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'publications', label: 'Research' },
  { id: 'contact', label: 'Contact' },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        // Pick the most visible intersecting section
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: '-72px 0px -55% 0px', // account for sticky header, trigger earlier
        threshold: [0, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isRecruiter, toggleMode } = usePortfolioMode();
  const menuId = 'mobile-nav';
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const reduced = prefersReducedMotion();
  const navItems = isRecruiter ? RECRUITER_NAV_ITEMS : NAV_ITEMS;
  const activeId = useActiveSection(navItems.map(n => n.id));

  // Close on Escape and on resize to desktop + focus management (18M)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        // return focus to trigger after animation
        requestAnimationFrame(() => buttonRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey);

    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mq.addEventListener('change', onChange);

    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onChange);
    };
  }, [isMenuOpen]);

  // When menu opens, move focus to first link/button inside (disclosure pattern)
  useEffect(() => {
    if (isMenuOpen) {
      // wait for DOM mount after AnimatePresence
      const id = window.setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLElement>('a, button');
        first?.focus();
      }, 20);
      return () => window.clearTimeout(id);
    }
  }, [isMenuOpen]);

  // Lock body scroll only when menu acts as modal (covers content). Here it's inline dropdown, so no lock needed.
  // Just ensure click outside closes is not required per spec simplest pattern.

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: 'var(--border)',
        height: '56px',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <Container className="h-full">
        <div className="flex items-center justify-between h-full gap-2 min-w-0">
          <a
            href="#hero"
            className="text-sm font-semibold tracking-tight shrink-0"
            style={{ color: 'var(--text)', minWidth: 0 }}
            aria-label="Go to top"
          >
            {PROFILE.shortName}
          </a>

          <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm min-w-0" aria-label="Primary">
            {navItems.map(item => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className="relative py-1 transition-colors"
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: '-6px',
                        height: '1px',
                        background: 'var(--accent)',
                      }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleMode}
              aria-pressed={isRecruiter}
              aria-label={isRecruiter ? 'Switch to standard view' : 'Switch to recruiter view'}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none shrink-0"
              style={
                isRecruiter
                  ? { background: 'var(--accent-subtle)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              {isRecruiter ? 'Standard view' : 'Recruiter view'}
            </button>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-md !px-2 !py-1 shrink-0"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v1.5M12 20.5V22M4.93 4.93l1.06 1.06M17.66 17.66l1.06 1.06M2 12h1.5M20.5 12H22M4.93 19.07l1.06-1.06M17.66 6.34l1.06-1.06" />
                </svg>
              )}
            </Button>

            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(v => !v)}
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              style={{ color: 'var(--text)' }}
            >
              <span className="relative w-5 h-5 flex items-center justify-center" aria-hidden="true">
                <span
                  className="block absolute w-5 h-0.5 transition-all"
                  style={{
                    background: 'var(--text-muted)',
                    transform: isMenuOpen ? 'rotate(45deg)' : 'translateY(-5px)',
                  }}
                />
                <span
                  className="block absolute w-5 h-0.5 transition-all"
                  style={{
                    background: 'var(--text-muted)',
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block absolute w-5 h-0.5 transition-all"
                  style={{
                    background: 'var(--text-muted)',
                    transform: isMenuOpen ? 'rotate(-45deg)' : 'translateY(5px)',
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            id={menuId}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }}
            className="md:hidden border-t overflow-y-auto overscroll-contain"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              maxHeight: 'calc(100dvh - 56px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <Container>
              <nav className="py-2" aria-label="Mobile">
                <button
                  type="button"
                  onClick={() => {
                    toggleMode();
                    setIsMenuOpen(false);
                  }}
                  aria-pressed={isRecruiter}
                  className="flex items-center min-h-[44px] w-full px-2 text-sm rounded-md transition-colors text-left focus-visible:outline-none"
                  style={{
                    color: isRecruiter ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isRecruiter ? 'var(--accent-subtle)' : 'transparent',
                    border: `1px solid ${isRecruiter ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  {isRecruiter ? 'Standard view' : 'Recruiter view'}
                </button>
                {navItems.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center min-h-[44px] px-2 text-sm rounded-md transition-colors"
                    style={{ color: activeId === item.id ? 'var(--text)' : 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
