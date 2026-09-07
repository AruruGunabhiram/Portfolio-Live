import { lazy, Suspense } from 'react';
import { Hero, Experience, Projects, EngineeringPractices, Skills, Education, Publications, Certifications, Leadership, Contact } from '../sections';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { prefersReducedMotion } from '../utils';
import { Container } from '../components';
import { ExperienceProjectsBridge } from '../components/transitions/ExperienceProjectsBridge';

const AskGuna = lazy(() => import('../sections/AskGuna').then(m => ({ default: m.AskGuna })));

function AskGunaFallback() {
  return (
    <section id="ask-guna" aria-labelledby="ask-guna-heading" className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        <h2 id="ask-guna-heading" className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Ask Guna
        </h2>
        <p className="text-sm leading-relaxed mt-2 max-w-[60ch]" style={{ color: 'var(--text-muted)' }}>
          Ask about projects, experience, research, or skills.
        </p>
        <div className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }} aria-busy="true">
          Loading…
        </p>
      </Container>
    </section>
  );
}

export const Home = () => {
  const { isRecruiter } = usePortfolioMode();
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  return (
    <div
      key={isRecruiter ? 'recruiter' : 'standard'}
      style={{ opacity: 1, transition: reduced ? 'none' : 'opacity 200ms ease' }}
    >
      <Hero />
      <Experience />
      <ExperienceProjectsBridge />
      <Projects />
      <EngineeringPractices />
      <Education />
      <Publications />
      <Certifications />
      <Skills />
      <Leadership />
      <Suspense fallback={<AskGunaFallback />}>
        <AskGuna />
      </Suspense>
      <Contact />
    </div>
  );
};
