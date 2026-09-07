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
      <Contact />
    </>
  );
};
