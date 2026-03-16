import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { EXPERIENCE } from '../data/resume';

export const Experience = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const roleColor = isGeekMode ? 'text-[#5ba8c4]' : 'text-[#818cf8]';
  const meta = isGeekMode ? 'text-[#4a7080]' : 'text-gray-500';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';
  const bullet = isGeekMode ? 'text-[#4a8fa8]' : 'text-gray-500';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50'
    : 'bg-[#141428]/70 border border-gray-700/40';
  const line = isGeekMode ? 'bg-[#2a5060]' : 'bg-gray-700/50';
  const dot = isGeekMode ? 'bg-[#5ba8c4]' : 'bg-[#646cff]';

  return (
    <section id="experience" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Experience
        </motion.h2>

        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {/* Vertical timeline line */}
          <div className={`absolute left-3 top-2 bottom-2 w-px ${line} hidden sm:block`} />

          <div className="space-y-8">
            {EXPERIENCE.map(job => (
              <motion.div key={job.id} variants={fadeInUp} className="sm:pl-12 relative">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full ${dot} hidden sm:flex items-center justify-center`}>
                  <div className="w-2 h-2 rounded-full bg-[#080c1a]" />
                </div>

                <div className={`rounded-xl p-4 sm:p-6 ${surface}`}>
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-5">
                    <div>
                      <h3 className={`text-lg sm:text-xl font-semibold ${accent}`}>
                        {job.role}{job.techLabel ? ` (${job.techLabel})` : ''}{' '}
                        <span className={`font-normal ${roleColor}`}>
                          — {job.companyShort ?? job.company}
                        </span>
                      </h3>
                    </div>
                    <div className={`text-sm sm:text-right shrink-0 ${meta}`}>
                      <p>{job.period}</p>
                      <p>{job.location}</p>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2.5">
                    {job.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                        <span className={`mt-[3px] shrink-0 text-xs ${bullet}`}>▸</span>
                        <span className={body}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
