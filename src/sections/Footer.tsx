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
    <footer className={`py-8 ${isGeekMode ? 'border-t border-cyber-cyan/30' : 'border-t border-gray-800'}`}>
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className={`text-sm ${isGeekMode ? 'text-cyber-cyan' : 'text-gray-400'}`}>
            {isGeekMode ? '> ' : ''}© {currentYear} Gunabhiram Aruru. All rights reserved.
          </div>

          <nav className="flex flex-wrap gap-3 sm:gap-6 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm transition-cyber ${
                  isGeekMode
                    ? 'text-cyber-cyan hover:text-cyber-pink hover:text-glow-neon'
                    : 'text-gray-400 hover:text-dark-accent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className={`text-sm ${isGeekMode ? 'text-cyber-cyan/60' : 'text-gray-500'}`}>
             <a href="https://github.com/gunabhiram-aruru" target="_blank" rel="noopener noreferrer" className={isGeekMode ? 'text-cyber-pink hover:underline' : 'hover:underline'}>gunabhiram-aruru</a> - <span className={isGeekMode ? 'text-cyber-purple' : ''}>🤖</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
