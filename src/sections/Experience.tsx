import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { EXPERIENCE } from '../data/experience';

export const Experience = () => {
  return (
    <section id="experience" className="py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Experience
        </motion.h2>

        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          <div className="absolute left-3 top-2 bottom-2 w-px hidden sm:block" style={{ background: 'var(--border)' }} />

          <div className="space-y-8">
            {EXPERIENCE.map(job => (
              <motion.div key={job.id} variants={fadeInUp} className="sm:pl-12 relative">
                <div
                  className="absolute left-0 top-1.5 w-6 h-6 rounded-full hidden sm:flex items-center justify-center"
                  style={{ background: 'var(--accent)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--bg)' }} />
                </div>

                <div
                  className="rounded-md p-4 sm:p-6"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text)' }}>
                        {job.role}
                        {job.techLabel ? ` (${job.techLabel})` : ''}{' '}
                        <span className="font-normal" style={{ color: 'var(--accent)' }}>
                          — {job.companyShort ?? job.company}
                        </span>
                      </h3>
                    </div>
                    <div className="text-sm sm:text-right shrink-0" style={{ color: 'var(--text-muted)' }}>
                      <p>{job.period}</p>
                      <p>{job.location}</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {job.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                        <span className="mt-[3px] shrink-0 text-xs" style={{ color: 'var(--accent)' }}>
                          ▸
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
