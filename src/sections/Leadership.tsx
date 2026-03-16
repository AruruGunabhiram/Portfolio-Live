import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { LEADERSHIP } from '../data/resume';

export const Leadership = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const roleColor = isGeekMode ? 'text-[#5ba8c4]' : 'text-[#818cf8]';
  // const orgColor = isGeekMode ? 'text-[#4a7080]' : 'text-gray-500';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50'
    : 'bg-[#141428]/70 border border-gray-700/40';
  const dot = isGeekMode ? 'bg-[#5ba8c4]' : 'bg-[#646cff]';

  return (
    <section id="leadership" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-10 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Leadership
        </motion.h2>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {LEADERSHIP.map(entry => (
            <motion.div
              key={entry.id}
              variants={fadeInUp}
              className={`rounded-xl p-4 sm:p-6 flex gap-3 sm:gap-4 items-start ${surface}`}
            >
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <div>
                <p className={`font-semibold text-base ${accent}`}>
                  {entry.role}{' '}
                  <span className={`font-normal text-sm ${roleColor}`}>— {entry.org}</span>
                </p>
                <p className={`text-sm mt-1 leading-relaxed ${body}`}>{entry.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
