import { Container } from '../components';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <footer className="py-8 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} Gunabhiram Aruru. All rights reserved.
          </div>

          <nav className="flex flex-wrap gap-4 sm:gap-6 justify-center" aria-label="Footer">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {link.label}
              </a>
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
