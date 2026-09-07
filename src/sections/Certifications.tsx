import { motion } from 'framer-motion';
import { Container } from '../components';
import { CERTIFICATIONS } from '../data/certifications';
import { prefersReducedMotion } from '../utils';

export const Certifications = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  if (!CERTIFICATIONS.length) return null;

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
    <section id="certifications" className="py-16 sm:py-20 relative">
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
            Certifications
          </motion.h2>

          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          <div className="mt-8 sm:mt-10 space-y-0">
            {CERTIFICATIONS.map(cert => (
              <motion.div
                key={cert.id}
                variants={item}
                className="grid lg:grid-cols-[200px_1fr] gap-5 lg:gap-10 items-start py-6 first:pt-0 last:pb-0 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Left — year / issuer meta */}
                <div className="lg:pt-1 min-w-0">
                  {typeof cert.year === 'number' && (
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                      {cert.year}
                    </p>
                  )}
                  <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {cert.issuer}
                  </p>
                </div>

                {/* Right — credential */}
                <article className="min-w-0">
                  <h3 className="text-[17px] sm:text-lg font-semibold leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
                    {cert.title}
                  </h3>
                  {cert.summary && (
                    <p className="text-sm leading-relaxed mt-2 max-w-prose" style={{ color: 'var(--text-secondary)' }}>
                      {cert.summary}
                    </p>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium mt-3 underline-offset-4 hover:underline focus-visible:outline-none"
                      style={{ color: 'var(--accent)' }}
                      aria-label={`Verify credential: ${cert.title}`}
                    >
                      Verify credential <span aria-hidden="true">↗</span>
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
