import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { EDUCATION } from '../data/education';

export const Education = () => {
  return (
    <section id="education" className="py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Education
        </motion.h2>

        <motion.div
          className="rounded-md divide-y"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {EDUCATION.map(e => (
            <motion.div
              key={e.id}
              variants={fadeInUp}
              className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>{e.institution}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.degree}</p>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>GPA {e.gpa}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.period}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.location}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
