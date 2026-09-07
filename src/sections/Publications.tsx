import { motion } from 'framer-motion';
import { Container } from '../components';
import { PUBLICATIONS } from '../data/publications';
import { prefersReducedMotion } from '../utils';

export const Publications = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  if (!PUBLICATIONS.length) return null;

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

  // Newest first — canonical year descending; single entry currently is 2025.
  const sorted = [...PUBLICATIONS].sort((a, b) => b.year - a.year);

  return (
    <section id="publications" className="py-16 sm:py-20 relative">
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
            Publications
          </motion.h2>

          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          <div className="mt-8 sm:mt-10 space-y-0">
            {sorted.map(pub => (
              <motion.div
                key={pub.id}
                variants={item}
                className="grid lg:grid-cols-[200px_1fr] gap-5 lg:gap-10 items-start py-6 first:pt-0 last:pb-0 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Left — year / venue meta (flattened on mobile) */}
                <div className="lg:pt-1 min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                    {pub.year}
                  </p>
                  <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {pub.venue}
                  </p>
                </div>

                {/* Right — publication content */}
                <article className="min-w-0">
                  <h3
                    className="text-[17px] sm:text-lg font-semibold leading-snug tracking-tight"
                    style={{ color: 'var(--text)', textWrap: 'balance' as const }}
                  >
                    {pub.title}
                  </h3>

                  {pub.highlights.length > 0 && (
                    <p className="text-sm leading-relaxed mt-3 max-w-prose" style={{ color: 'var(--text-secondary)' }}>
                      {pub.highlights[0]}
                    </p>
                  )}

                  {pub.paperUrl && (
                    <a
                      href={pub.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium mt-4 underline-offset-4 hover:underline focus-visible:outline-none"
                      style={{ color: 'var(--accent)' }}
                      aria-label={`View paper: ${pub.title}`}
                    >
                      View paper <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
