import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { EDUCATION } from '../data/resume';

export const Education = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const school = isGeekMode ? 'text-[#8bbfd4]' : 'text-gray-200';
  const meta = isGeekMode ? 'text-[#4a7080]' : 'text-gray-500';
  const gpaColor = isGeekMode ? 'text-[#5ba8c4]' : 'text-[#818cf8]';
  const divider = isGeekMode ? 'divide-[#1e3a4a]/60' : 'divide-gray-700/40';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/60 border border-[#2a5060]/40'
    : 'bg-[#141428]/60 border border-gray-700/30';

  return (
    <section id="education" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-10 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Education
        </motion.h2>

        <motion.div
          className={`rounded-xl divide-y ${surface} ${divider}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {EDUCATION.map(e => (
            <motion.div
              key={e.id}
              variants={fadeInUp}
              className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className={`font-semibold text-base ${school}`}>{e.school}</p>
                <p className={`text-sm mt-0.5 ${meta}`}>{e.degree}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${gpaColor}`}>GPA {e.gpa}</p>
                <p className={`text-xs mt-0.5 ${meta}`}>{e.period}</p>
                <p className={`text-xs ${meta}`}>{e.location}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
