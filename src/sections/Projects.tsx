import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport, prefersReducedMotion } from '../utils';
import { PROJECTS } from '../data/resume';
import type { ProjectEntry } from '../data/resume';

// ─── Progress indicator ────────────────────────────────────────────────────────

interface ProgressIndicatorProps {
  activeIndex: number;
  total: number;
  isGeekMode: boolean;
}

const ProgressIndicator = ({ activeIndex, total, isGeekMode }: ProgressIndicatorProps) => {
  const lineColor = isGeekMode ? 'rgba(91,168,196,0.2)' : 'rgba(129,140,248,0.18)';
  const dotActive = isGeekMode ? '#5ba8c4' : '#818cf8';
  const dotInactive = isGeekMode ? 'rgba(91,168,196,0.25)' : 'rgba(129,140,248,0.22)';
  const labelColor = isGeekMode ? '#4a8fa8' : '#6b7280';

  return (
    <div
      className="hidden md:flex flex-col items-center gap-0 select-none"
      style={{ minWidth: '44px' }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex flex-col items-center">
          {/* Dot */}
          <div
            style={{
              width: i === activeIndex ? 9 : 6,
              height: i === activeIndex ? 9 : 6,
              borderRadius: '50%',
              backgroundColor: i === activeIndex ? dotActive : dotInactive,
              transition: 'all 0.35s ease',
              boxShadow: i === activeIndex ? `0 0 8px ${dotActive}55` : 'none',
            }}
          />
          {/* Label */}
          <span
            style={{
              fontSize: '9px',
              color: labelColor,
              marginTop: '4px',
              letterSpacing: '0.05em',
              opacity: i === activeIndex ? 1 : 0.5,
              transition: 'opacity 0.35s ease',
              fontFamily: 'inherit',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          {/* Connector line */}
          {i < total - 1 && (
            <div
              style={{
                width: '1px',
                height: '40px',
                backgroundColor: lineColor,
                margin: '6px 0',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Single project panel (desktop narrative view) ─────────────────────────────

interface ProjectPanelProps {
  project: ProjectEntry;
  index: number;
  isGeekMode: boolean;
}

const ProjectPanel = ({ project, index, isGeekMode }: ProjectPanelProps) => {
  const accent = isGeekMode ? '#7ec0d6' : '#fff';
  const subtitle = isGeekMode ? '#4a8fa8' : '#818cf8';
  const body = isGeekMode ? '#7eaabb' : '#d1d5db';
  const bullet = isGeekMode ? '#4a8fa8' : '#6b7280';
  const chip = isGeekMode
    ? 'bg-[#0a1a22] text-[#5ba8c4] border border-[#2a5060]/60'
    : 'bg-[#1a1a30] text-gray-400 border border-gray-700/50';
  const linkColor = isGeekMode
    ? 'text-[#5ba8c4] hover:text-[#7ec0d6]'
    : 'text-[#818cf8] hover:text-[#a5b4fc]';

  return (
    <motion.article
      initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-2xl"
    >
      {/* Index hint */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        style={{ color: isGeekMode ? '#2a5060' : '#374151', fontSize: '11px', marginBottom: '10px', letterSpacing: '0.12em' }}
      >
        {isGeekMode ? '> ' : ''}{String(index + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
      </motion.div>

      {/* Title */}
      <motion.h3
        style={{ color: accent, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '6px' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.38 }}
      >
        {isGeekMode ? '> ' : ''}{project.title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        style={{ color: subtitle, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        {project.subtitle}
      </motion.p>

      {/* Tech chips */}
      <motion.div
        className="flex flex-wrap gap-1.5 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.38 }}
      >
        {project.techStack.map(tech => (
          <span key={tech} className={`text-xs px-2 py-0.5 rounded-md border ${chip}`}>
            {tech}
          </span>
        ))}
      </motion.div>

      {/* Bullets — staggered */}
      <ul className="space-y-2.5 mb-6">
        {project.bullets.map((b, i) => (
          <motion.li
            key={i}
            className="flex gap-2.5 text-sm leading-relaxed"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: 'easeOut' }}
          >
            <span style={{ color: bullet, marginTop: '3px', flexShrink: 0, fontSize: '11px' }}>▸</span>
            <span style={{ color: body }}>{b}</span>
          </motion.li>
        ))}
      </ul>

      {/* GitHub link */}
      {project.githubUrl && (
        <motion.a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${linkColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + project.bullets.length * 0.07, duration: 0.3 }}
        >
          View on GitHub →
        </motion.a>
      )}
    </motion.article>
  );
};

// ─── Desktop scroll-narrative ──────────────────────────────────────────────────

const SCROLL_MULTIPLIER = 1.6; // section height = N * SCROLL_MULTIPLIER * 100vh

const DesktopNarrative = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const n = PROJECTS.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    const idx = Math.min(Math.floor(v * n), n - 1);
    setActiveIndex(idx);
  });

  const sectionHeight = `${n * SCROLL_MULTIPLIER * 100}vh`;

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';

  return (
    <div
      ref={sectionRef}
      style={{ height: sectionHeight, position: 'relative' }}
      aria-label="Projects section"
    >
      {/* Sticky inner container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Section title row */}
        <div className="mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold ${accent}`}>
            {isGeekMode ? '> ' : ''}Projects
          </h2>
          <p style={{ fontSize: '11px', color: isGeekMode ? '#2a5060' : '#4b5563', marginTop: '6px', letterSpacing: '0.08em' }}>
            Scroll to explore each project
          </p>
        </div>

        {/* Progress + project content */}
        <div className="flex items-start gap-10">
          <ProgressIndicator
            activeIndex={activeIndex}
            total={n}
            isGeekMode={isGeekMode}
          />

          <div className="flex-1" style={{ minHeight: '420px' }}>
            <AnimatePresence mode="wait">
              <ProjectPanel
                key={activeIndex}
                project={PROJECTS[activeIndex]}
                index={activeIndex}
                isGeekMode={isGeekMode}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            color: isGeekMode ? '#2a4a58' : '#374151',
            letterSpacing: '0.08em',
          }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          scroll
        </motion.div>
      </div>
    </div>
  );
};

// ─── Mobile stacked cards ──────────────────────────────────────────────────────

const MobileCards = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const subtitle = isGeekMode ? 'text-[#4a8fa8]' : 'text-[#818cf8]';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';
  const bulletCol = isGeekMode ? 'text-[#4a8fa8]' : 'text-gray-500';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50'
    : 'bg-[#141428]/70 border border-gray-700/40';
  const chip = isGeekMode
    ? 'bg-[#0a1a22] text-[#5ba8c4] border border-[#2a5060]/60'
    : 'bg-[#1a1a30] text-gray-400 border border-gray-700/50';
  const linkColor = isGeekMode
    ? 'text-[#5ba8c4] hover:text-[#7ec0d6]'
    : 'text-[#818cf8] hover:text-[#a5b4fc]';

  return (
    <div>
      <motion.h2
        className={`text-3xl md:text-4xl font-bold mb-10 ${accent}`}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={fadeInUp}
      >
        {isGeekMode ? '> ' : ''}Projects
      </motion.h2>

      <motion.div
        className="flex flex-col gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={staggerContainer}
      >
        {PROJECTS.map(project => (
          <motion.article
            key={project.id}
            variants={fadeInUp}
            className={`rounded-xl p-6 flex flex-col gap-4 ${surface}`}
          >
            <div>
              <h3 className={`text-lg font-semibold leading-snug ${accent}`}>
                {isGeekMode ? '> ' : ''}{project.title}
              </h3>
              <p className={`text-xs font-medium mt-1 uppercase tracking-wider ${subtitle}`}>
                {project.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map(tech => (
                <span key={tech} className={`text-xs px-2 py-0.5 rounded-md border ${chip}`}>
                  {tech}
                </span>
              ))}
            </div>
            <ul className="space-y-2 flex-1">
              {project.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className={`mt-[3px] shrink-0 text-xs ${bulletCol}`}>▸</span>
                  <span className={body}>{b}</span>
                </li>
              ))}
            </ul>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`self-start text-xs font-medium transition-colors ${linkColor}`}
              >
                View on GitHub →
              </a>
            )}
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Exported component ────────────────────────────────────────────────────────

export const Projects = () => {
  const { isGeekMode } = useTheme();
  const [isDesktop, setIsDesktop] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Always show mobile layout on small screens, or when reduced motion is preferred
  if (!isDesktop || reduced) {
    return (
      <section id="projects" className="py-20 relative">
        <Container>
          <MobileCards isGeekMode={isGeekMode} />
        </Container>
      </section>
    );
  }

  return (
    <section id="projects" className="relative">
      <Container>
        <DesktopNarrative isGeekMode={isGeekMode} />
      </Container>
    </section>
  );
};
