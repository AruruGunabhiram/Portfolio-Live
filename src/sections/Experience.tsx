import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { Container } from '../components';
import { EXPERIENCE } from '../data/experience';
import { prefersReducedMotion } from '../utils';
import { useExperienceEntryProgress } from '../hooks/useSectionTransitionProgress';
import { ProjxonExperienceStory } from '../components/experience/ProjxonExperienceStory';
import { InfiniAIExperienceStory } from '../components/experience/InfiniAIExperienceStory';

export const Experience = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;
  const expRef = useRef<HTMLElement>(null);
  const entryProgress = useExperienceEntryProgress(expRef);
  const bridgeScaleX = useTransform(entryProgress, [0, 1], [0.78, 1]);
  const bridgeOpacity = useTransform(entryProgress, [0, 0.5, 1], [0.42, 0.85, 1]);
  const signalX = useTransform(entryProgress, [0.3, 0.9], [0, 240]);

  if (!EXPERIENCE.length) return null;

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
    <section id="experience" ref={expRef} className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        {/* Bridge: subtle continuation from Hero → Experience (bounded scroll, transform only) */}
        <motion.div
          className="h-px max-w-[640px] mb-0 pointer-events-none"
          style={{ background: 'var(--border)', scaleX: bridgeScaleX, opacity: bridgeOpacity, transformOrigin: 'left' } as unknown as React.CSSProperties}
          aria-hidden="true"
        />
        <motion.div
          className="relative h-[2px] max-w-[640px] pointer-events-none"
          style={{ opacity: bridgeOpacity } as unknown as React.CSSProperties}
          aria-hidden="true"
        >
          <motion.span
            className="absolute top-0 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', x: signalX, y: '-2px' } as unknown as React.CSSProperties}
          />
        </motion.div>

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
            Experience
          </motion.h2>

          {/* subtle divider under heading — not a graphic */}
          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)', scaleX: bridgeScaleX, transformOrigin: 'left' } as unknown as React.CSSProperties}
            aria-hidden="true"
          />

          <div className="mt-8 sm:mt-10 space-y-12 sm:space-y-16">
            {EXPERIENCE.map(job => {
              const year = job.period.match(/\d{4}/)?.[0] ?? '';
              const isProjxon = job.id === 'projxon-ai-intern';

              return (
                <motion.div
                  key={job.id}
                  variants={item}
                  className="grid lg:grid-cols-[200px_1fr] gap-5 lg:gap-10 items-start"
                >
                  {/* Left — date metadata (flattened on mobile) */}
                  <div className="lg:pt-1 min-w-0">
                    {year && (
                      <p
                        className="text-[11px] font-semibold tracking-[0.12em] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {year}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                      {job.period}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: 'var(--text-muted)' }}>
                      {job.location}
                    </p>
                    {isProjxon && (
                      <p className="mt-3 text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                        Current
                      </p>
                    )}
                  </div>

                  {/* Right — experience content + visual (professional narrative, not cards) */}
                  <article className="min-w-0 pb-2 lg:pb-0" style={{ borderColor: 'var(--border)' }}>
                    <h3
                      className="text-[17px] sm:text-lg font-semibold leading-tight tracking-tight break-words"
                      style={{ color: 'var(--text)', overflowWrap: 'anywhere' as const }}
                    >
                      {job.companyShort ?? job.company}
                    </h3>
                    <p
                      className="text-sm font-medium mt-1 leading-snug"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {job.role}
                    </p>

                    {/* Visual — compact engineering system */}
                    <div className="mt-5 min-w-0">
                      {isProjxon ? <ProjxonExperienceStory /> : <InfiniAIExperienceStory />}
                    </div>

                    <ul className="mt-5 space-y-2.5">
                      {job.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                          <span
                            className="mt-[7px] w-1 h-1 rounded-full shrink-0"
                            style={{ background: 'var(--text-muted)' }}
                            aria-hidden="true"
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {job.technologies && job.technologies.length > 0 && (
                      <p
                        className="mt-5 pt-3 border-t text-sm break-words"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}
                      >
                        <span className="sr-only">Technologies: </span>
                        {job.technologies.join(' · ')}
                      </p>
                    )}
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
