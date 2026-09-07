import { motion } from 'framer-motion';
import { Container } from '../components';
import { LEADERSHIP } from '../data/leadership';
import { prefersReducedMotion } from '../utils';

export const Leadership = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  if (!LEADERSHIP.length) return null;

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

  return (
    <section id="leadership" className="py-16 sm:py-20 relative">
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
            Leadership
          </motion.h2>

          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          <div className="mt-8 sm:mt-10 space-y-0">
            {LEADERSHIP.map(entry => {
              // Optional period support for future entries — not present in current canonical data
              const period = (entry as unknown as { period?: string }).period;
              const year = period?.match(/\d{4}/)?.[0] ?? '';

              return (
                <motion.div
                  key={entry.id}
                  variants={item}
                  className="grid lg:grid-cols-[200px_1fr] gap-5 lg:gap-10 items-start py-6 first:pt-0 last:pb-0 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Left — role/period meta (flattened on mobile, compact desktop column) */}
                  <div className="lg:pt-1 min-w-0">
                    {period ? (
                      <>
                        {year && (
                          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                            {year}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                          {period}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                        {entry.role}
                      </p>
                    )}
                  </div>

                  {/* Right — organization + description */}
                  <article className="min-w-0">
                    <h3
                      className="text-[17px] sm:text-lg font-semibold leading-tight tracking-tight"
                      style={{ color: 'var(--text)' }}
                    >
                      {entry.organization}
                    </h3>
                    {/* Show role as secondary only when period exists (to avoid duplication when left already shows role) */}
                    {period && (
                      <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        {entry.role}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed mt-3 max-w-prose" style={{ color: 'var(--text-secondary)' }}>
                      {entry.description}
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
