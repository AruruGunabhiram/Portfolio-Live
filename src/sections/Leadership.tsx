import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { LEADERSHIP } from '../data/leadership';
import { prefersReducedMotion } from '../utils';

const LeadershipOutreachVisual = lazy(() =>
  import('../components/closing/closingVisuals').then(m => ({ default: m.LeadershipOutreachVisual }))
);

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
    <section id="leadership" className="py-12 sm:py-16 lg:py-20 relative">
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

          <div className="mt-8 sm:mt-10 grid md:grid-cols-[1fr_200px] gap-6 md:gap-10 items-start">
            <div className="min-w-0 space-y-0">
            {LEADERSHIP.map(entry => {
              const period = entry.period;
              const year = period?.match(/\d{4}/)?.[0] ?? '';
              const isCurrent = period?.includes('Present');

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
                          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                            <span>{year}</span>
                            {isCurrent && (
                              <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase border"
                                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface)' }}
                              >
                                Current
                              </span>
                            )}
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
                      className="text-[17px] sm:text-lg font-semibold leading-tight tracking-tight break-words"
                      style={{ color: 'var(--text)', overflowWrap: 'anywhere' as const }}
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

            {/* Outreach as connection — decorative, factual by omission */}
            <motion.div variants={item} className="min-w-0 md:pt-2">
              <Suspense fallback={null}>
                <LeadershipOutreachVisual />
              </Suspense>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
