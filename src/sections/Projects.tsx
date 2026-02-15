import { Container, Card, Button } from '../components';
import { useTheme } from '../hooks';
import { PROJECTS } from '../utils';

export const Projects = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="projects" className="py-20">
      <Container>
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
          {isGeekMode ? '> ' : ''}Featured Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <article key={project.id}>
              <Card>
                <h3 className={`text-xl font-bold mb-3 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
                  {isGeekMode ? '> ' : ''}{project.title}
                </h3>

                <p className={`mb-4 ${isGeekMode ? 'text-geek-text/80' : 'text-gray-400'}`}>
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className={`text-sm px-3 py-1 rounded ${isGeekMode ? 'bg-geek-accent/20 text-geek-accent border border-geek-accent' : 'bg-dark-accent/20 text-dark-accent'}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {project.githubUrl && (
                    <Button
                      variant="ghost"
                      className="text-sm px-4 py-2"
                      onClick={() => window.open(project.githubUrl, '_blank')}
                    >
                      GitHub
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button
                      variant="ghost"
                      className="text-sm px-4 py-2"
                      onClick={() => window.open(project.liveUrl, '_blank')}
                    >
                      Live Demo
                    </Button>
                  )}
                </div>
              </Card>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};
