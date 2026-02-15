import { Container } from '../components';
import { useTheme } from '../hooks';

export const Footer = () => {
  const { isGeekMode } = useTheme();
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    <footer className={`py-8 ${isGeekMode ? 'border-t border-geek-accent' : 'border-t border-gray-800'}`}>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className={`text-sm ${isGeekMode ? 'text-geek-text' : 'text-gray-400'}`}>
            {isGeekMode ? '> ' : ''}© {currentYear} Your Name. All rights reserved.
          </div>

          <nav className="flex flex-wrap gap-6 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm ${isGeekMode ? 'text-geek-text hover:text-geek-accent' : 'text-gray-400 hover:text-dark-accent'} transition-colors`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className={`text-sm ${isGeekMode ? 'text-geek-text/60' : 'text-gray-500'}`}>
            Built with React + TypeScript
          </div>
        </div>
      </Container>
    </footer>
  );
};
