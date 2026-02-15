import { motion } from 'framer-motion';
import { Container, Button } from '../components';
import { useTheme } from '../hooks';
import { SOCIAL_LINKS, fadeInUp, staggerContainer, scrollViewport } from '../utils';

export const Contact = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="contact" className="py-20">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-8 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Get In Touch
        </motion.h2>

        <motion.div
          className="max-w-2xl space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          <motion.p
            className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
            variants={fadeInUp}
          >
            {isGeekMode ? '> ' : ''}
            I'm always interested in hearing about new projects and opportunities.
            Whether you have a question or just want to say hi, feel free to reach out!
          </motion.p>

          <motion.div className="space-y-4" variants={fadeInUp}>
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
                {isGeekMode ? '> ' : ''}Email
              </h3>
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className={`${isGeekMode ? 'text-geek-text hover:text-geek-accent' : 'text-dark-accent hover:text-blue-400'} transition-colors`}
              >
                {SOCIAL_LINKS.email}
              </a>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => window.open(SOCIAL_LINKS.github, '_blank')}
              >
                GitHub
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open(SOCIAL_LINKS.linkedin, '_blank')}
              >
                LinkedIn
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
