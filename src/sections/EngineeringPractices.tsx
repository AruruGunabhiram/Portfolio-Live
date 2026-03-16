import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { ENGINEERING_PRACTICES } from '../data/resume';

export const EngineeringPractices = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const intro = isGeekMode ? 'text-[#5a7888]' : 'text-gray-400';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50'
    : 'bg-[#141428]/70 border border-gray-700/40';
  const labelColor = isGeekMode ? 'text-[#5ba8c4]' : 'text-[#818cf8]';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';

  return (
    <section id="practices" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Engineering Practices
        </motion.h2>

        <motion.p
          className={`text-sm mb-10 max-w-2xl leading-relaxed ${intro}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          I build systems that are readable, testable, and resilient—focused on reliability, observability, and clean interfaces.
        </motion.p>

        <motion.ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {ENGINEERING_PRACTICES.map(practice => (
            <motion.li
              key={practice.label}
              variants={fadeInUp}
              className={`rounded-xl px-5 py-4 flex gap-3 ${surface}`}
            >
              <span className={`mt-[2px] shrink-0 text-xs`} style={{ color: isGeekMode ? '#3a6a7a' : '#6b7280' }}>▸</span>
              <span className="text-sm leading-relaxed">
                <span className={`font-semibold ${labelColor}`}>{practice.label}:</span>{' '}
                <span className={body}>{practice.description}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
};
