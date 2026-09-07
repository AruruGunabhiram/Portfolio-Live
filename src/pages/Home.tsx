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

export const Home = () => {
  return (
    <>
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
    </>
  );
};
