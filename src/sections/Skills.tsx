import { useRef, useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container, ParallaxLayer } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, scrollViewport, useGSAP, isBrowser, prefersReducedMotion } from '../utils';
import { SKILLS } from '../data/skills';

// Lazy load heavy 3D component
const Skill3DSphere = lazy(() =>
  import('../components/skills').then(module => ({ default: module.Skill3DSphere }))
);
const SkillRadialChart = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillRadialChart }))
);
const SkillGridView = lazy(() =>
  import('../components/skills').then(module => ({ default: module.SkillGridView }))
);

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

type ViewMode = 'radial' | '3d' | 'grid';

// Loading spinner component
const LoadingSpinner = ({ isGeekMode, text }: { isGeekMode: boolean; text: string }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative w-16 h-16">
      <motion.div
        className={`absolute inset-0 rounded-full border-4 border-transparent ${
          isGeekMode ? 'border-t-cyber-cyan' : 'border-t-dark-accent'
        }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className={`absolute inset-2 rounded-full ${
          isGeekMode ? 'bg-cyber-cyan/10' : 'bg-dark-accent/10'
        }`}
      />
    </div>
    <p className={`text-sm ${isGeekMode ? 'text-cyber-text' : 'text-gray-400'}`}>
      {isGeekMode ? '> ' : ''}{text}
    </p>
  </div>
);

// Grid skeleton loader
const GridSkeleton = ({ isGeekMode }: { isGeekMode: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <motion.div
        key={index}
        className={`rounded-xl p-6 ${
          isGeekMode
            ? 'bg-cyber-bg-dark/20 border border-cyber-cyan/30'
            : 'bg-dark-surface/20 border border-gray-700/30'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        {/* Icon skeleton */}
        <div
          className={`w-12 h-12 rounded-lg mb-3 ${
            isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'
          }`}
        >
          <motion.div
            className={`h-full w-full rounded-lg ${
              isGeekMode ? 'bg-cyber-cyan/30' : 'bg-gray-600/50'
            }`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Title skeleton */}
        <div
          className={`h-6 w-3/4 rounded mb-2 ${
            isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'
          }`}
        >
          <motion.div
            className={`h-full w-full rounded ${
              isGeekMode ? 'bg-cyber-cyan/30' : 'bg-gray-600/50'
            }`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
          />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div
            className={`h-3 w-full rounded ${
              isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'
            }`}
          >
            <motion.div
              className={`h-full w-full rounded ${
                isGeekMode ? 'bg-cyber-cyan/30' : 'bg-gray-600/50'
              }`}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
          </div>
          <div
            className={`h-3 w-5/6 rounded ${
              isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'
            }`}
          >
            <motion.div
              className={`h-full w-full rounded ${
                isGeekMode ? 'bg-cyber-cyan/30' : 'bg-gray-600/50'
              }`}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
          </div>
        </div>

        {/* Skill tags skeleton */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 + (index % 3) }).map((_, tagIndex) => (
            <div
              key={tagIndex}
              className={`h-7 w-16 rounded-full ${
                isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'
              }`}
            >
              <motion.div
                className={`h-full w-full rounded-full ${
                  isGeekMode ? 'bg-cyber-cyan/30' : 'bg-gray-600/50'
                }`}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4 + tagIndex * 0.1,
                }}
              />
            </div>
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);

export const Skills = () => {
  const { isGeekMode } = useTheme();

  // Restore last selected view from localStorage, default to 'grid'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (!isBrowser) return 'grid';
    const savedView = localStorage.getItem('skillViewMode') as ViewMode;
    return savedView || 'grid';
  });

  const [clickedButton, setClickedButton] = useState<ViewMode | null>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skillBarsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Persist view mode to localStorage
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('skillViewMode', viewMode);
    }
  }, [viewMode]);

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

  // Get skills data - flat for 3D/rough views
  const allSkills = SKILLS;

  // Handle view mode change with haptic animation
  const handleViewChange = (mode: ViewMode) => {
    setClickedButton(mode);
    // Reset click animation after completion
    setTimeout(() => setClickedButton(null), 400);
    // Change view mode
    setViewMode(mode);
  };

  // Handle keyboard navigation for view toggle
  const handleKeyDown = (e: React.KeyboardEvent, mode: ViewMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleViewChange(mode);
    }
  };

  const viewModes: Array<{ mode: ViewMode; label: string; description: string }> = [
    { mode: 'grid', label: 'Grid', description: 'Organized card-based skill categories' },
    { mode: 'radial', label: 'Constellation', description: 'Interconnected tech ecosystem' },
    { mode: '3d', label: '3D Sphere', description: 'Interactive 3D sphere visualization' },
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
          {viewModes.map(({ mode, label, description }) => {
            const isActive = viewMode === mode;
            const isClicked = clickedButton === mode;

            return (
              <motion.button
                key={mode}
                onClick={() => handleViewChange(mode)}
                onKeyDown={(e) => handleKeyDown(e, mode)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isActive
                    ? isGeekMode
                      ? 'bg-cyber-cyan text-cyber-bg-dark border-2 border-cyber-cyan'
                      : 'bg-dark-accent text-white border-2 border-dark-accent'
                    : isGeekMode
                    ? 'bg-transparent text-cyber-cyan border-2 border-cyber-cyan hover:bg-cyber-cyan/10'
                    : 'bg-transparent text-gray-300 border-2 border-gray-700 hover:bg-dark-surface/50'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`skill-view-${mode}`}
                aria-label={`${label}: ${description}`}
                tabIndex={isActive ? 0 : -1}
                // Haptic bounce animation on click
                animate={{
                  scale: isClicked ? [1, 0.95, 1.05, 1] : isActive ? 1.05 : 1,
                }}
                transition={{
                  duration: isClicked ? 0.4 : 0.3,
                  ease: 'easeOut',
                }}
                whileHover={{
                  scale: isActive ? 1.05 : 1.02,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                {isGeekMode ? '> ' : ''}{label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* View Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            role="tabpanel"
            id={`skill-view-${viewMode}`}
            aria-label={`${viewMode} view of skills`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: viewMode === 'grid' ? 0.4 : 0.3,
              ease: 'easeInOut',
              delay: 0.1, // 100ms pause between exit and enter
            }}
          >
            {viewMode === 'grid' && (
              <Suspense
                fallback={
                  <GridSkeleton isGeekMode={isGeekMode} />
                }
              >
                <SkillGridView isGeekMode={isGeekMode} />
              </Suspense>
            )}

            {viewMode === 'radial' && (
              <Suspense
                fallback={
                  <div className="h-[700px] flex items-center justify-center">
                    <LoadingSpinner isGeekMode={isGeekMode} text="Loading constellation map..." />
                  </div>
                }
              >
                <SkillRadialChart isGeekMode={isGeekMode} />
              </Suspense>
            )}

            {viewMode === '3d' && (
              <Suspense
                fallback={
                  <div className="h-[500px] flex items-center justify-center">
                    <LoadingSpinner isGeekMode={isGeekMode} text="Loading 3D visualization..." />
                  </div>
                }
              >
                <Skill3DSphere
                  skills={allSkills
                    .filter(skill => skill.level !== undefined)
                    .map(skill => ({ name: skill.name, level: skill.level! }))
                  }
                  isGeekMode={isGeekMode}
                />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Screen reader description */}
        <div className="sr-only" aria-live="polite">
          Currently viewing {viewMode} visualization of skills. Use tab to navigate between view modes.
        </div>
      </Container>
    </section>
  );
};
