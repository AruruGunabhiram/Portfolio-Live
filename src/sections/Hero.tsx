import { Container, Button } from '../components';
import { useTheme } from '../hooks';

export const Hero = () => {
  const { isGeekMode } = useTheme();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center">
      <Container>
        <div className="space-y-6">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
            {isGeekMode ? '> ' : ''}Hi, I'm <span className={isGeekMode ? 'text-geek-text' : 'text-dark-accent'}>Your Name</span>
          </h1>

          <p className={`text-xl md:text-2xl ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}>
            {isGeekMode ? '> ' : ''}Full Stack Developer & Designer
          </p>

          <p className={`text-lg max-w-2xl ${isGeekMode ? 'text-geek-text/80' : 'text-gray-400'}`}>
            {isGeekMode ? '> ' : ''}I build exceptional digital experiences that combine beautiful design with powerful functionality.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="primary" onClick={() => scrollToSection('projects')}>
              View My Work
            </Button>
            <Button variant="secondary" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};
