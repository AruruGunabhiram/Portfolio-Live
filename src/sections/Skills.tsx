import { useRef, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container, ParallaxLayer } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, scrollViewport, useGSAP, isBrowser, prefersReducedMotion } from '../utils';
import { SKILLS, getSkillsGroupedByCategory } from '../data/skills';

// Lazy load heavy 3D component
const Skill3DSphere = lazy(() =>
  import('../components/skills').then(module => ({ default: module.Skill3DSphere }))
);
const SkillRadialChart = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillRadialChart }))
);
const SkillBarsRough = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillBarsRough }))
);
const SkillTimeline = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillTimeline }))
);
const SkillGridView = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillGridView }))
);

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

type ViewMode = 'bars' | 'radial' | '3d' | 'rough' | 'grid';

export const Skills = () => {
  const { isGeekMode } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('bars');
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skillBarsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP ScrollTrigger animations for skill bars
  useGSAP(() => {
    if (!isBrowser || viewMode !== 'bars') return;

    const reducedMotion = prefersReducedMotion();

    // Animate category headers
    categoryRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.from(ref, {
          scrollTrigger: {
            trigger: ref,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: -30,
          duration: reducedMotion ? 0 : 0.6,
          delay: reducedMotion ? 0 : index * 0.1,
          ease: 'power2.out',
        });
      }
    });

    // Animate skill bars with fill effect
    skillBarsRefs.current.forEach((ref, index) => {
      if (ref) {
        const bar = ref.querySelector('.skill-bar-fill');
        const targetWidth = ref.getAttribute('data-level') || '0';

        if (bar) {
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: `${targetWidth}%`,
              scrollTrigger: {
                trigger: ref,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                scrub: reducedMotion ? false : 1,
              },
              duration: reducedMotion ? 0 : 1.5,
              delay: reducedMotion ? 0 : index * 0.05,
              ease: 'power3.out',
            }
          );
        }
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.killAll();
    };
  }, [viewMode]);

  // Get skills data - grouped for timeline, flat for 3D/rough views
  const groupedSkills = getSkillsGroupedByCategory();
  const allSkills = SKILLS;

  // Handle keyboard navigation for view toggle
  const handleKeyDown = (e: React.KeyboardEvent, mode: ViewMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setViewMode(mode);
    }
  };

  const viewModes: Array<{ mode: ViewMode; label: string; description: string }> = isGeekMode
    ? [
        { mode: 'grid', label: 'Grid', description: 'Organized card-based skill categories' },
        { mode: 'bars', label: 'Timeline', description: 'Journey through technology learning' },
        { mode: 'radial', label: 'Constellation', description: 'Interconnected tech ecosystem' },
        { mode: '3d', label: '3D Sphere', description: 'Interactive 3D sphere visualization' },
      ]
    : [
        { mode: 'grid', label: 'Grid', description: 'Organized card-based skill categories' },
        { mode: 'bars', label: 'Timeline', description: 'Journey through technology learning' },
        { mode: 'rough', label: 'Sketch', description: 'Hand-drawn artistic view' },
        { mode: 'radial', label: 'Constellation', description: 'Interconnected tech ecosystem' },
      ];

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Parallax Background Layer */}
      <ParallaxLayer speed={-10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <div className={`w-[600px] h-[600px] rounded-full ${isGeekMode ? 'bg-geek-accent' : 'bg-dark-accent'} blur-3xl`} />
      </ParallaxLayer>

      <Container className="relative z-10">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-8 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Skills & Technologies
        </motion.h2>

        {/* View Mode Toggle */}
        <motion.div
          className="mb-12 flex flex-wrap gap-4 justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
          role="tablist"
          aria-label="Skill visualization modes"
        >
          {viewModes.map(({ mode, label, description }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              onKeyDown={(e) => handleKeyDown(e, mode)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                viewMode === mode
                  ? isGeekMode
                    ? 'bg-cyber-cyan text-cyber-bg-dark glow-cyan hover:glow-pink'
                    : 'bg-dark-accent text-white shadow-lg'
                  : isGeekMode
                  ? 'bg-cyber-cyan/20 text-cyber-text border border-cyber-cyan hover:bg-cyber-cyan/30 hover:border-cyber-pink'
                  : 'bg-dark-surface text-gray-300 border border-gray-700 hover:bg-dark-surface/80'
              }`}
              role="tab"
              aria-selected={viewMode === mode}
              aria-controls={`skill-view-${mode}`}
              aria-label={`${label}: ${description}`}
              tabIndex={viewMode === mode ? 0 : -1}
            >
              {isGeekMode ? '> ' : ''}{label}
            </button>
          ))}
        </motion.div>

        {/* View Content */}
        <div
          role="tabpanel"
          id={`skill-view-${viewMode}`}
          aria-label={`${viewMode} view of skills`}
        >
          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Suspense fallback={
                <div className="h-[600px] flex items-center justify-center">
                  <div className={`text-lg ${isGeekMode ? 'text-geek-accent' : 'text-dark-accent'}`}>
                    Loading grid view...
                  </div>
                </div>
              }>
                <SkillGridView isGeekMode={isGeekMode} />
              </Suspense>
            </motion.div>
          )}

          {viewMode === 'bars' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Suspense fallback={
                <div className="h-[500px] flex items-center justify-center">
                  <div className={`text-lg ${isGeekMode ? 'text-geek-accent' : 'text-dark-accent'}`}>
                    Loading technology timeline...
                  </div>
                </div>
              }>
                <SkillTimeline skills={groupedSkills} isGeekMode={isGeekMode} />
              </Suspense>
            </motion.div>
          )}

          {viewMode === 'radial' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Suspense fallback={
                <div className="h-[700px] flex items-center justify-center">
                  <div className={`text-lg ${isGeekMode ? 'text-geek-accent' : 'text-dark-accent'}`}>
                    Loading comprehensive constellation map...
                  </div>
                </div>
              }>
                <SkillRadialChart isGeekMode={isGeekMode} />
              </Suspense>
            </motion.div>
          )}

          {viewMode === '3d' && isGeekMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Suspense fallback={
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-lg text-geek-accent">Loading 3D visualization...</div>
                </div>
              }>
                <Skill3DSphere skills={allSkills} isGeekMode={isGeekMode} />
              </Suspense>
            </motion.div>
          )}

          {viewMode === 'rough' && !isGeekMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Suspense fallback={
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-lg text-dark-accent">Loading sketch view...</div>
                </div>
              }>
                <SkillBarsRough skills={allSkills} isGeekMode={isGeekMode} />
              </Suspense>
            </motion.div>
          )}
        </div>

        {/* Screen reader description */}
        <div className="sr-only" aria-live="polite">
          Currently viewing {viewMode} visualization of skills. Use tab to navigate between view modes.
        </div>
      </Container>
    </section>
  );
};
