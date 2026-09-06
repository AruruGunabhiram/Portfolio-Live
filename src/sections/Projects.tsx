import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport, prefersReducedMotion } from '../utils';
import { PROJECTS } from '../data/projects';
import type { Project, CaseStudy } from '../types/portfolio';

// ─── SocialLens case study collapsible ────────────────────────────────────────

interface CaseStudyBlockProps {
  caseStudy: CaseStudy;
  onOpenChange?: (open: boolean) => void;
  onGoToNext?: () => void;
  nextProjectTitle?: string;
}

const CaseStudyBlock = ({ caseStudy, onOpenChange, onGoToNext, nextProjectTitle }: CaseStudyBlockProps) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggle}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface-subtle)' }}
          aria-expanded={open}
        >
          <span>SocialLens — Mini Case Study</span>
          <span style={{ fontSize: '9px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>

        {open && onGoToNext && nextProjectTitle && (
          <button onClick={onGoToNext} className="text-xs transition-colors whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            Skip → {nextProjectTitle}
          </button>
        )}
      </div>

      {open && (
        <div
          className="mt-3 rounded-md p-5 space-y-4"
          style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>{caseStudy.oneLiner}</p>
          {caseStudy.sections.map(sec => (
            <div key={sec.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--accent)' }}>
                {sec.heading}
              </p>
              {sec.content && <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sec.content}</p>}
              {sec.bullets && (
                <ul className="space-y-1">
                  {sec.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed">
                      <span className="mt-[3px] shrink-0" style={{ color: 'var(--accent)' }}>▸</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {onGoToNext && nextProjectTitle && (
            <div className="pt-4 border-t flex flex-col items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={onGoToNext}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-md border transition-colors"
                style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                Continue to Next Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Next: {nextProjectTitle}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Progress indicator ────────────────────────────────────────────────────────

interface ProgressIndicatorProps {
  activeIndex: number;
  total: number;
}

const ProgressIndicator = ({ activeIndex, total }: ProgressIndicatorProps) => {
  return (
    <div className="hidden md:flex flex-col items-center gap-0 select-none" style={{ minWidth: '44px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            style={{
              width: i === activeIndex ? 9 : 6,
              height: i === activeIndex ? 9 : 6,
              borderRadius: '50%',
              backgroundColor: i === activeIndex ? 'var(--accent)' : 'var(--border-strong)',
              transition: 'all 0.35s ease',
              opacity: i === activeIndex ? 1 : 0.6,
            }}
          />
          <span
            style={{
              fontSize: '9px',
              color: 'var(--text-muted)',
              marginTop: '4px',
              letterSpacing: '0.05em',
              opacity: i === activeIndex ? 1 : 0.5,
              transition: 'opacity 0.35s ease',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          {i < total - 1 && <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)', margin: '6px 0' }} />}
        </div>
      ))}
    </div>
  );
};

// ─── Single project panel ─────────────────────────────

interface ProjectPanelProps {
  project: Project;
  index: number;
  onCaseStudyToggle?: (open: boolean) => void;
  onGoToNext?: () => void;
  nextProjectTitle?: string;
}

const ProjectPanel = ({ project, index, onCaseStudyToggle, onGoToNext, nextProjectTitle }: ProjectPanelProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-2xl"
    >
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '10px', letterSpacing: '0.12em' }}
      >
        {String(index + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
      </motion.div>

      <motion.h3
        style={{ color: 'var(--text)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '6px' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.38 }}
      >
        {project.title}
      </motion.h3>

      <motion.p
        style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        {project.subtitle}
      </motion.p>

      <motion.div className="flex flex-wrap gap-1.5 mb-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.38 }}>
        {project.technologies.map(tech => (
          <span
            key={tech}
            className="text-xs px-2 py-0.5 rounded-md border"
            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {tech}
          </span>
        ))}
      </motion.div>

      <ul className="space-y-2.5 mb-6">
        {project.highlights.map((b, i) => (
          <motion.li
            key={i}
            className="flex gap-2.5 text-sm leading-relaxed"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: 'easeOut' }}
          >
            <span style={{ color: 'var(--accent)', marginTop: '3px', flexShrink: 0, fontSize: '11px' }}>▸</span>
            <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
          </motion.li>
        ))}
      </ul>

      {project.links.github && (
        <motion.a
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + project.highlights.length * 0.07, duration: 0.3 }}
        >
          View on GitHub →
        </motion.a>
      )}

      {project.caseStudy && (
        <CaseStudyBlock caseStudy={project.caseStudy} onOpenChange={onCaseStudyToggle} onGoToNext={onGoToNext} nextProjectTitle={nextProjectTitle} />
      )}
    </motion.article>
  );
};

// ─── Desktop scroll-narrative ──────────────────────────────────────────────────

const SCROLL_MULTIPLIER = 1.6;

const DesktopNarrative = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const isCaseStudyOpenRef = useRef(false);
  const n = PROJECTS.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    if (isCaseStudyOpenRef.current) return;
    const idx = Math.min(Math.floor(v * n), n - 1);
    setActiveIndex(idx);
  });

  const goToProject = useCallback(
    (index: number) => {
      document.body.style.overflow = '';
      if (stickyRef.current) {
        stickyRef.current.style.overflowY = 'hidden';
        stickyRef.current.style.overscrollBehavior = '';
        stickyRef.current.style.justifyContent = 'center';
        stickyRef.current.style.paddingTop = '0px';
      }
      isCaseStudyOpenRef.current = false;
      setIsCaseStudyOpen(false);
      setActiveIndex(index);

      if (sectionRef.current) {
        const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        const sectionH = n * SCROLL_MULTIPLIER * window.innerHeight;
        const targetScrollY = sectionTop + (index / n) * (sectionH - window.innerHeight);
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      }
    },
    [n]
  );

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!isCaseStudyOpen || !sticky || activeIndex >= n - 1) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      const atBottom = sticky.scrollTop + sticky.clientHeight >= sticky.scrollHeight - 80;
      if (atBottom) {
        if (!timer) timer = setTimeout(() => goToProject(activeIndex + 1), 400);
      } else {
        if (timer) { clearTimeout(timer); timer = null; }
      }
    };
    sticky.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      sticky.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [isCaseStudyOpen, activeIndex, n, goToProject]);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (isCaseStudyOpen) {
      document.body.style.overflow = 'hidden';
      if (sticky) {
        sticky.style.overflowY = 'auto';
        sticky.style.overscrollBehavior = 'contain';
        sticky.style.justifyContent = 'flex-start';
        sticky.style.paddingTop = '80px';
      }
    } else {
      document.body.style.overflow = '';
      if (sticky) {
        sticky.style.overflowY = 'hidden';
        sticky.style.overscrollBehavior = '';
        sticky.style.justifyContent = 'center';
        sticky.style.paddingTop = '0px';
      }
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCaseStudyOpen]);

  const handleCaseStudyToggle = (open: boolean) => {
    isCaseStudyOpenRef.current = open;
    setIsCaseStudyOpen(open);
  };

  const sectionHeight = `${n * SCROLL_MULTIPLIER * 100}vh`;

  return (
    <div ref={sectionRef} style={{ height: sectionHeight, position: 'relative' }} aria-label="Projects section">
      <div
        ref={stickyRef}
        style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}
      >
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Projects
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '0.08em' }}>
            {isCaseStudyOpen ? 'Scroll to read • ESC or ▼ to close' : 'Scroll to explore each project'}
          </p>
        </div>

        <div className="flex items-start gap-10">
          <ProgressIndicator activeIndex={activeIndex} total={n} />
          <div className="flex-1" style={{ minHeight: '420px' }}>
            <AnimatePresence mode="wait">
              <ProjectPanel
                key={activeIndex}
                project={PROJECTS[activeIndex]}
                index={activeIndex}
                onCaseStudyToggle={handleCaseStudyToggle}
                onGoToNext={activeIndex < n - 1 ? () => goToProject(activeIndex + 1) : undefined}
                nextProjectTitle={activeIndex < n - 1 ? PROJECTS[activeIndex + 1].title : undefined}
              />
            </AnimatePresence>
          </div>
        </div>

        {!isCaseStudyOpen && (
          <motion.div
            style={{ position: 'absolute', bottom: '28px', right: '0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
            scroll
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─── Mobile stacked cards ──────────────────────────────────────────────────────

const MobileCards = () => {
  return (
    <div>
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 tracking-tight"
        style={{ color: 'var(--text)' }}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={fadeInUp}
      >
        Projects
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
            className="rounded-md p-4 sm:p-6 flex flex-col gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div>
              <h3 className="text-lg font-semibold leading-snug" style={{ color: 'var(--text)' }}>{project.title}</h3>
              <p className="text-xs font-medium mt-1 uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{project.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map(tech => (
                <span key={tech} className="text-xs px-2 py-0.5 rounded-md border" style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {tech}
                </span>
              ))}
            </div>
            <ul className="space-y-2 flex-1">
              {project.highlights.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-[3px] shrink-0 text-xs" style={{ color: 'var(--accent)' }}>▸</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                </li>
              ))}
            </ul>
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="self-start text-xs font-medium" style={{ color: 'var(--accent)' }}>
                View on GitHub →
              </a>
            )}
            {project.caseStudy && <CaseStudyBlock caseStudy={project.caseStudy} />}
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Exported component ────────────────────────────────────────────────────────

export const Projects = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isDesktop || reduced) {
    return (
      <section id="projects" className="py-20 relative">
        <Container>
          <MobileCards />
        </Container>
      </section>
    );
  }

  return (
    <section id="projects" className="relative">
      <Container>
        <DesktopNarrative />
      </Container>
    </section>
  );
};
