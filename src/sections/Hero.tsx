import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { PROFILE } from '../data/profile';
import { CONTACT } from '../data/contact';
import { EDUCATION } from '../data/education';
import { PUBLICATIONS } from '../data/publications';
import { EXPERIENCE } from '../data/experience';
import { PROJECTS } from '../data/projects';
import { prefersReducedMotion } from '../utils';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { HeroEngineeringScene } from '../components/hero/HeroEngineeringScene';
import { useHeroExperienceProgress } from '../hooks/useSectionTransitionProgress';

// Compact credibility block — typography + separators, no cards
function HeroProof() {
  const edu = EDUCATION[0];
  const pub = PUBLICATIONS[0];
  const exp = EXPERIENCE[0];

  return (
    <div
      className="border-t lg:border-t-0 lg:border-l lg:pl-8 lg:ml-2 pt-6 lg:pt-2 mt-2"
      style={{ borderColor: 'var(--border)' }}
      aria-label="Credibility highlights"
    >
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
        Credibility
      </p>
      <div className="space-y-5">
        {/* Education */}
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {edu.degree}
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {edu.institution}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {edu.period}
          </p>
        </div>

        <div className="h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />

        {/* Publication */}
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {pub.venue} Publication
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {pub.title}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {pub.year}
          </p>
        </div>

        <div className="h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />

        {/* Experience */}
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {exp.role}
          </p>
          <p className="text-sm leading-snug mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {exp.company} · {exp.location}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {exp.period}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroProofRow() {
  const edu = EDUCATION[0];
  const pub = PUBLICATIONS[0];
  const exp = EXPERIENCE[0];
  return (
    <div
      className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 pt-5 mt-1 border-t text-sm"
      style={{ borderColor: 'var(--border)' }}
      aria-label="Credibility highlights"
    >
      <div className="flex gap-3 items-start min-w-0">
        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
        <span className="leading-snug min-w-0">
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            {edu.degree}
          </span>
          <span style={{ color: 'var(--text-muted)' }}> · {edu.institution}</span>
        </span>
      </div>
      <div className="hidden sm:block w-px self-stretch shrink-0" style={{ background: 'var(--border)' }} aria-hidden="true" />
      <div className="flex gap-3 items-start min-w-0">
        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
        <span className="leading-snug min-w-0">
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            {pub.venue}
          </span>
          <span style={{ color: 'var(--text-muted)' }}> · Published research · {pub.year}</span>
        </span>
      </div>
      <div className="hidden sm:block w-px self-stretch shrink-0" style={{ background: 'var(--border)' }} aria-hidden="true" />
      <div className="flex gap-3 items-start min-w-0">
        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
        <span className="leading-snug min-w-0">
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            {exp.role}
          </span>
          <span style={{ color: 'var(--text-muted)' }}> · {exp.companyShort ?? exp.company}</span>
        </span>
      </div>
    </div>
  );
}

export const Hero = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;
  const { isRecruiter } = usePortfolioMode();
  const heroRef = useRef<HTMLElement>(null);
  const transitionProgress = useHeroExperienceProgress(heroRef);

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.07,
        delayChildren: reduced ? 0 : 0.04,
      },
    },
  };

  const item = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.42, ease: 'easeOut' as const },
    },
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ minHeight: 'min(82svh, 760px)' }}
      aria-labelledby="hero-heading"
    >
      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        {/* Editorial + asymmetric proof — single column on mobile/tablet, two columns on lg+ */}
        <motion.div
          className="grid lg:grid-cols-[1.35fr_0.9fr] gap-10 lg:gap-12 xl:gap-16 items-start"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Left — primary editorial */}
          <div className="min-w-0">
            <motion.div variants={item} className="space-y-5">
              {/* Name — strongest element */}
              <h1
                id="hero-heading"
                className="font-bold tracking-tight leading-[0.95] break-words"
                style={{
                  color: 'var(--text)',
                  fontSize: 'clamp(2.5rem, 6.5vw, 4.75rem)',
                  letterSpacing: '-0.03em',
                  overflowWrap: 'anywhere' as const,
                  textWrap: 'balance' as const,
                }}
              >
                {PROFILE.name}
              </h1>

              {/* Role hierarchy */}
              <div className="space-y-1 pt-1">
                <p
                  className="font-semibold tracking-tight leading-none"
                  style={{
                    color: 'var(--text)',
                    fontSize: 'clamp(1.25rem, 2.6vw, 1.65rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Software Engineer
                </p>
                <p
                  className="font-medium tracking-wide"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9375rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  AI Systems · Backend · Full Stack
                </p>
              </div>

              {/* Value proposition — one concise statement, line-length controlled */}
              <p
                className="leading-relaxed max-w-[42rem] pt-1"
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.0625rem)',
                  lineHeight: '1.65',
                }}
              >
                {PROFILE.valueProposition}
              </p>
              {isRecruiter && (
                <p
                  className="text-xs leading-relaxed pt-2 max-w-[42rem] break-words"
                  style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}
                >
                  <span className="inline">{EDUCATION[0].degree} · {EDUCATION[0].institution}</span>
                  <span className="hidden sm:inline"> · </span>
                  <span className="block sm:inline mt-1 sm:mt-0">
                    {EXPERIENCE[0].role} · {EXPERIENCE[0].companyShort ?? EXPERIENCE[0].company} · {PUBLICATIONS[0].venue} · {PUBLICATIONS[0].year} · {PROJECTS.filter(p => p.featured).length} featured projects
                  </span>
                </p>
              )}
            </motion.div>

            {/* CTAs — max 2 high-emphasis, recruiter makes Resume primary */}
            <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap gap-3 pt-6 min-w-0">
              {isRecruiter ? (
                <>
                  <a
                    href={CONTACT.resumeUrl}
                    download="Gunabhiram_Resume.pdf"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium border shadow-sm transition-colors focus-visible:outline-none min-h-[44px] min-w-0 flex-1 sm:flex-none"
                    style={{
                      background: 'var(--accent-button)',
                      color: '#ffffff',
                      borderColor: 'var(--accent-button)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    View Resume
                  </a>
                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium border bg-transparent transition-colors focus-visible:outline-none min-h-[44px] min-w-0 flex-1 sm:flex-none"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--text)',
                    }}
                  >
                    Explore Projects
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium border shadow-sm transition-colors focus-visible:outline-none min-h-[44px] min-w-0 flex-1 sm:flex-none"
                    style={{
                      background: 'var(--accent-button)',
                      color: '#ffffff',
                      borderColor: 'var(--accent-button)',
                    }}
                  >
                    Explore Projects
                  </a>
                  <a
                    href={CONTACT.resumeUrl}
                    download="Gunabhiram_Resume.pdf"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium border bg-transparent transition-colors focus-visible:outline-none min-h-[44px] min-w-0 flex-1 sm:flex-none"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--text)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    View Resume
                  </a>
                </>
              )}
            </motion.div>

            {/* Low-emphasis external links */}
            <motion.div variants={item} className="flex flex-wrap gap-4 pt-4 text-sm">
              <a
                href={CONTACT.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
                style={{ color: 'var(--text-muted)' }}
              >
                GitHub
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <a
                href={CONTACT.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
                style={{ color: 'var(--text-muted)' }}
              >
                LinkedIn
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </motion.div>

            {/* Compact engineering system — below CTAs on tablet/mobile, above proof */}
            <motion.div variants={item} className="lg:hidden pt-6 min-w-0">
              <HeroEngineeringScene transitionProgress={transitionProgress} />
            </motion.div>

            {/* Mobile/tablet credibility — horizontal row; hidden on lg where vertical block is used */}
            <motion.div variants={item} className="lg:hidden">
              <HeroProofRow />
            </motion.div>

            {/* Scroll cue — subtle, non-animated */}
            <motion.div variants={item} className="pt-8">
              <a
                href="#experience"
                className="inline-flex items-center gap-1.5 text-xs tracking-wide focus-visible:outline-none"
                style={{ color: 'var(--text-muted)' }}
              >
                Experience
                <span aria-hidden="true">↓</span>
              </a>
            </motion.div>
          </div>

          {/* Right — engineering system + proof, desktop only */}
          <motion.div variants={item} className="hidden lg:block min-w-0 space-y-6">
            <HeroEngineeringScene transitionProgress={transitionProgress} />
            <HeroProof />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
