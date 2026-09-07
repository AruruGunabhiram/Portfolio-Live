import { motion } from 'framer-motion';
import { Container } from '../components';
import { EDUCATION } from '../data/education';
import { prefersReducedMotion } from '../utils';

export const Education = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  if (!EDUCATION.length) return null;

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.08,
        delayChildren: reduced ? 0 : 0.04,
      },
    },
  };

  const item = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.38, ease: 'easeOut' as const },
    },
  };

  // Chronology: current degree first — canonical order is already most-recent first (CU Boulder 2025–2027, SRM 2021–2025)
  // If canonical order changes, sorting by period string would be fragile; keep explicit order as stored.

  return (
    <section id="education" className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
          variants={container}
        >
          <motion.h2
            variants={item}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Education
          </motion.h2>

          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          <div className="mt-8 sm:mt-10 space-y-0">
            {EDUCATION.map(entry => {
              const year = entry.period.match(/\d{4}/)?.[0] ?? '';

              return (
                <motion.div
                  key={entry.id}
                  variants={item}
                  className="grid lg:grid-cols-[200px_1fr] gap-5 lg:gap-10 items-start py-6 first:pt-0 last:pb-0 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Left — date / meta (flattened on mobile) */}
                  <div className="lg:pt-1 min-w-0">
                    {year && (
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                        {year}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                      {entry.period}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: 'var(--text-muted)' }}>
                      {entry.location}
                    </p>
                  </div>

                  {/* Right — institution + degree */}
                  <article className="min-w-0">
                    <h3 className="text-[17px] sm:text-lg font-semibold leading-tight tracking-tight break-words" style={{ color: 'var(--text)', overflowWrap: 'anywhere' as const }}>
                      {entry.institution}
                    </h3>
                    <p className="text-sm font-medium mt-1 leading-snug break-words" style={{ color: 'var(--text-secondary)', overflowWrap: 'anywhere' as const }}>
                      {entry.degree}
                    </p>
                  </article>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
