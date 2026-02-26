import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { SKILLS } from '../data/resume';

export const Skills = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const catLabel = isGeekMode ? 'text-[#4a8fa8]' : 'text-[#818cf8]';
  const skillTag = isGeekMode
    ? 'bg-[#0a1a22] text-[#8bbfd4] border border-[#2a5060]/50'
    : 'bg-[#1a1a30] text-gray-300 border border-gray-700/50';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/60 border border-[#2a5060]/40'
    : 'bg-[#141428]/60 border border-gray-700/30';

  return (
    <section id="skills" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-12 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Technical Skills
        </motion.h2>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {SKILLS.map(cat => (
            <motion.div
              key={cat.id}
              variants={fadeInUp}
              className={`rounded-xl p-5 ${surface}`}
            >
              <h3 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${catLabel}`}>
                {cat.category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map(skill => (
                  <span key={skill} className={`text-xs px-2.5 py-1 rounded-md border ${skillTag}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
