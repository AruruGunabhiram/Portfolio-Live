import { Container } from '../components';
import { useTheme } from '../hooks';
import { SKILLS } from '../utils';

export const Skills = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="skills" className="py-20">
      <Container>
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
          {isGeekMode ? '> ' : ''}Skills & Technologies
        </h2>

        <div className="space-y-8">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className={`text-xl font-semibold mb-4 capitalize ${isGeekMode ? 'text-geek-text' : 'text-gray-200'}`}>
                {isGeekMode ? '> ' : ''}{category}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className={`px-4 py-3 rounded-lg text-center ${isGeekMode ? 'bg-geek-accent/10 border border-geek-accent text-geek-text' : 'bg-dark-surface border border-gray-700 text-gray-300'}`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
