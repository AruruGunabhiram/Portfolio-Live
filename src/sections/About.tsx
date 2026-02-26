import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, scrollViewport } from '../utils';
import { CONTACT } from '../data/resume';

export const About = () => {
  const { isGeekMode } = useTheme();
  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';

  return (
    <section id="about" className="py-16 relative">
      <Container>
        <motion.div
          className="max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${accent}`}>
            {isGeekMode ? '> ' : ''}About
          </h2>
          <p className={`text-base md:text-lg leading-relaxed ${body}`}>
            {isGeekMode ? '> ' : ''}
            {CONTACT.valueProposition} I work at the intersection of backend engineering and applied AI —
            building systems that are reliable, well-structured, and designed to scale.
            Previously at InfiniAI Technologies; currently open to full-time and internship opportunities.
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
