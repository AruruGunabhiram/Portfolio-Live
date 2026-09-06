import { Container } from '../components';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <footer className="py-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} Gunabhiram Aruru. All rights reserved.
          </div>

          <nav className="flex flex-wrap gap-3 sm:gap-6 justify-center">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <a href="https://github.com/AruruGunabhiram" target="_blank" rel="noopener noreferrer" className="link-accent">
              AruruGunabhiram
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
