import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { LEADERSHIP } from '../data/resume';

export const Leadership = () => {
  return (
    <section id="leadership" className="py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Leadership
        </motion.h2>

        <motion.div className="space-y-4" initial="hidden" whileInView="visible" viewport={scrollViewport} variants={staggerContainer}>
          {LEADERSHIP.map(entry => (
            <motion.div
              key={entry.id}
              variants={fadeInUp}
              className="rounded-md p-4 sm:p-6 flex gap-3 sm:gap-4 items-start"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
              <div>
                <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                  {entry.role} <span className="font-normal text-sm" style={{ color: 'var(--accent)' }}>— {entry.org}</span>
                </p>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{entry.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
