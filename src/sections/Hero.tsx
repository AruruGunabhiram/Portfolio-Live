import { motion } from 'framer-motion';
import { Container, Button } from '../components';
import { heroAnimation } from '../utils';
import { CONTACT, TECH_CHIPS } from '../data/resume';

export const Hero = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="flex items-center relative overflow-hidden" style={{ minHeight: 'min(82vh, 720px)' }}>
      <Container className="relative z-10 py-16 sm:py-24">
        <motion.div
          className="space-y-5 sm:space-y-6 max-w-3xl"
          variants={heroAnimation.container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            style={{ color: 'var(--text)' }}
            variants={heroAnimation.heading}
          >
            {CONTACT.name}
          </motion.h1>

          <motion.p
            className="text-base sm:text-xl md:text-2xl font-medium tracking-tight"
            style={{ color: 'var(--text-secondary)' }}
            variants={heroAnimation.subheading}
          >
            {CONTACT.headline}
          </motion.p>

          <motion.p
            className="text-base md:text-lg max-w-2xl leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
            variants={heroAnimation.description}
          >
            {CONTACT.valueProposition}
          </motion.p>

          <motion.div className="flex flex-wrap gap-1.5 pt-1" variants={heroAnimation.description}>
            {TECH_CHIPS.map(chip => (
              <span
                key={chip}
                className="text-xs px-2.5 py-1 rounded-md font-medium tracking-wide border"
                style={{
                  background: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {chip}
              </span>
            ))}
          </motion.div>

          <motion.div className="flex flex-wrap gap-3 pt-2" variants={heroAnimation.cta}>
            <Button variant="primary" onClick={() => scrollTo('projects')}>
              View Projects
            </Button>
            <Button variant="secondary" onClick={() => scrollTo('contact')}>
              Contact
            </Button>
            <a
              href={CONTACT.resumeUrl}
              download="Gunabhiram_Resume.pdf"
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border font-medium transition-colors"
              style={{
                borderColor: 'var(--border-strong)',
                color: 'var(--text-secondary)',
                background: 'transparent',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Resume
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
