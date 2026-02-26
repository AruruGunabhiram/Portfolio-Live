import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { PROJECTS } from '../data/resume';

export const Projects = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const subtitle = isGeekMode ? 'text-[#4a8fa8]' : 'text-[#818cf8]';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';
  const bullet = isGeekMode ? 'text-[#4a8fa8]' : 'text-gray-500';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50 hover:border-[#4a8fa8]/60'
    : 'bg-[#141428]/70 border border-gray-700/40 hover:border-gray-600/60';
  const chip = isGeekMode
    ? 'bg-[#0a1a22] text-[#5ba8c4] border border-[#2a5060]/60'
    : 'bg-[#1a1a30] text-gray-400 border border-gray-700/50';

  return (
    <section id="projects" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-12 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Projects
        </motion.h2>

        <motion.div
          className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {PROJECTS.map(project => (
            <motion.article
              key={project.id}
              variants={fadeInUp}
              className={`rounded-xl p-6 flex flex-col gap-4 transition-colors duration-200 ${surface}`}
            >
              {/* Title + subtitle */}
              <div>
                <h3 className={`text-lg font-semibold leading-snug ${accent}`}>
                  {isGeekMode ? '> ' : ''}{project.title}
                </h3>
                <p className={`text-xs font-medium mt-1 uppercase tracking-wider ${subtitle}`}>
                  {project.subtitle}
                </p>
              </div>

              {/* Tech stack chips */}
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map(tech => (
                  <span key={tech} className={`text-xs px-2 py-0.5 rounded-md border ${chip}`}>
                    {tech}
                  </span>
                ))}
              </div>

              {/* Bullets */}
              <ul className="space-y-2 flex-1">
                {project.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className={`mt-[3px] shrink-0 text-xs ${bullet}`}>▸</span>
                    <span className={body}>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Links */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`self-start text-xs font-medium transition-colors ${
                    isGeekMode
                      ? 'text-[#5ba8c4] hover:text-[#7ec0d6]'
                      : 'text-[#818cf8] hover:text-[#a5b4fc]'
                  }`}
                >
                  View on GitHub →
                </a>
              )}
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
