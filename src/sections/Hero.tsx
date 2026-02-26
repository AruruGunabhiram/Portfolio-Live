import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Container, Button, GlitchText } from '../components';
import { useTheme } from '../hooks';
import { heroAnimation } from '../utils';
import { CONTACT, IMPACT_HIGHLIGHTS } from '../data/resume';

const Scene3D = lazy(() =>
  import('../components/three').then(m => ({ default: m.Scene3D }))
);

export const Hero = () => {
  const { isGeekMode } = useTheme();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const sub = isGeekMode ? 'text-[#8bbfd4]' : 'text-gray-200';
  const dim = isGeekMode ? 'text-[#5a7888]' : 'text-gray-400';
  const chipBg = isGeekMode
    ? 'bg-[#0d1829] border border-[#3a6a7a]/50 text-[#5ba8c4]'
    : 'bg-[#1e2035] border border-gray-700/50 text-[#818cf8]';

  return (
    <section id="hero" className="min-h-screen flex items-center relative overflow-hidden">
      {isGeekMode && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}

      <Container className="relative z-10 py-24">
        <motion.div
          className="space-y-7 max-w-3xl"
          variants={heroAnimation.container}
          initial="hidden"
          animate="visible"
        >
          {/* Name */}
          <motion.h1
            className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight ${accent}`}
            variants={heroAnimation.heading}
          >
            {isGeekMode ? '> ' : ''}
            {isGeekMode ? (
              <GlitchText className="text-[#5ba8c4]">{CONTACT.name}</GlitchText>
            ) : (
              CONTACT.name
            )}
          </motion.h1>

          {/* Role */}
          <motion.p
            className={`text-xl md:text-2xl font-medium tracking-wide ${sub}`}
            variants={heroAnimation.subheading}
          >
            {isGeekMode ? '> ' : ''}{CONTACT.headline}
          </motion.p>

          {/* Value prop */}
          <motion.p
            className={`text-base md:text-lg max-w-2xl leading-relaxed ${dim}`}
            variants={heroAnimation.description}
          >
            {isGeekMode ? '> ' : ''}{CONTACT.valueProposition}
          </motion.p>

          {/* Impact highlights strip */}
          <motion.div
            className="flex flex-wrap gap-2 pt-1"
            variants={heroAnimation.description}
          >
            {IMPACT_HIGHLIGHTS.map(h => (
              <span key={h.label} className={`text-xs px-3 py-1.5 rounded-full font-medium ${chipBg}`}>
                <strong>{h.metric}</strong> {h.label}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-wrap gap-3 pt-2" variants={heroAnimation.cta}>
            <Button variant="primary" onClick={() => scrollTo('projects')}>
              View Projects
            </Button>
            <Button
              variant="secondary"
              onClick={() => scrollTo('contact')}
            >
              Contact
            </Button>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className={`inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border font-medium transition-colors ${
                isGeekMode
                  ? 'border-[#3a6a7a]/60 text-[#7ec0d6] hover:bg-[#3a6a7a]/15'
                  : 'border-gray-600/60 text-gray-300 hover:bg-gray-700/30'
              }`}
              title="PDF will be linked here"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Resume
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
