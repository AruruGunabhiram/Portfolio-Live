import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { ENGINEERING_PRACTICES } from '../data/practices';

export const EngineeringPractices = () => {
  return (
    <section id="practices" className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Engineering Practices
        </motion.h2>

        <motion.p
          className="text-sm mb-10 max-w-2xl leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          I build systems that are readable, testable, and resilient — focused on reliability, observability, and clean interfaces.
        </motion.p>

        <motion.ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {ENGINEERING_PRACTICES.map(practice => (
            <motion.li
              key={practice.label}
              variants={fadeInUp}
              className="rounded-md px-5 py-4 flex gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="mt-[2px] shrink-0 text-xs" style={{ color: 'var(--accent)' }}>▸</span>
              <span className="text-sm leading-relaxed">
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{practice.label}:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{practice.description}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
};
