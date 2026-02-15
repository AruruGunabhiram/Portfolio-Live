import { motion } from 'framer-motion';
import { Container, Button } from '../components';
import { useTheme } from '../hooks';
import { heroAnimation } from '../utils';

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
        <motion.div
          className="space-y-6"
          variants={heroAnimation.container}
          initial="hidden"
          animate="visible"
        >
          {/* Heading with fade in from top */}
          <motion.h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
            variants={heroAnimation.heading}
          >
            {isGeekMode ? '> ' : ''}Hi, I'm <span className={isGeekMode ? 'text-geek-text' : 'text-dark-accent'}>Your Name</span>
          </motion.h1>

          {/* Subheading with fade in up */}
          <motion.p
            className={`text-xl md:text-2xl ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
            variants={heroAnimation.subheading}
          >
            {isGeekMode ? '> ' : ''}Full Stack Developer & Designer
          </motion.p>

          {/* Description with fade in up */}
          <motion.p
            className={`text-lg max-w-2xl ${isGeekMode ? 'text-geek-text/80' : 'text-gray-400'}`}
            variants={heroAnimation.description}
          >
            {isGeekMode ? '> ' : ''}I build exceptional digital experiences that combine beautiful design with powerful functionality.
          </motion.p>

          {/* CTA Buttons with stagger animation */}
          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            variants={heroAnimation.cta}
          >
            <Button variant="primary" onClick={() => scrollToSection('projects')}>
              View My Work
            </Button>
            <Button variant="secondary" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
