import {
  Hero,
  Experience,
  Projects,
  EngineeringPractices,
  Skills,
  Education,
  Publications,
  Certifications,
  Leadership,
  AskGuna,
  Contact,
} from '../sections';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { prefersReducedMotion } from '../utils';

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
      <Projects />
      <EngineeringPractices />
      <Education />
      <Publications />
      <Certifications />
      <Skills />
      <Leadership />
      <AskGuna />
      <Contact />
    </div>
  );
};
