import { Container } from '../components';
import { useTheme } from '../hooks';

export const About = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="about" className="py-20">
      <Container>
        <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
          {isGeekMode ? '> ' : ''}About Me
        </h2>

        <div className="space-y-4 max-w-3xl">
          <p className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}>
            {isGeekMode ? '> ' : ''}
            I'm a passionate full-stack developer with a love for creating elegant solutions to complex problems.
            With expertise in modern web technologies, I specialize in building responsive, user-friendly applications
            that deliver exceptional experiences.
          </p>

          <p className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}>
            {isGeekMode ? '> ' : ''}
            My journey in software development has equipped me with a diverse skill set spanning front-end frameworks,
            back-end systems, and everything in between. I thrive on continuous learning and staying ahead of
            industry trends.
          </p>

          <p className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}>
            {isGeekMode ? '> ' : ''}
            When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects,
            or sharing knowledge with the developer community.
          </p>
        </div>
      </Container>
    </section>
  );
};
