import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, scrollViewport } from '../utils';
import { PROFILE } from '../data/profile';

export const About = () => {
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight" style={{ color: 'var(--text)' }}>
            About
          </h2>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {PROFILE.valueProposition} I work at the intersection of backend engineering and applied AI —
            building systems that are reliable, well-structured, and designed to scale. Previously at
            InfiniAI Technologies; currently open to full-time and internship opportunities.
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
