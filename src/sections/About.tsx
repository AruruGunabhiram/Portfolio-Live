import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';

export const About = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="about" className="py-20">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-8 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}About Me
        </motion.h2>

        <motion.div
          className="space-y-4 max-w-3xl"
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
            I'm a passionate full-stack developer with a love for creating elegant solutions to complex problems.
            With expertise in modern web technologies, I specialize in building responsive, user-friendly applications
            that deliver exceptional experiences.
          </motion.p>

          <motion.p
            className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
            variants={fadeInUp}
          >
            {isGeekMode ? '> ' : ''}
            My journey in software development has equipped me with a diverse skill set spanning front-end frameworks,
            back-end systems, and everything in between. I thrive on continuous learning and staying ahead of
            industry trends.
          </motion.p>

          <motion.p
            className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
            variants={fadeInUp}
          >
            {isGeekMode ? '> ' : ''}
            When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects,
            or sharing knowledge with the developer community.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
};
