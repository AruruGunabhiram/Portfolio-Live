import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { PUBLICATIONS } from '../data/resume';

export const Publications = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const venueColor = isGeekMode ? 'text-[#4a8fa8]' : 'text-[#818cf8]';
  const body = isGeekMode ? 'text-[#7eaabb]' : 'text-gray-300';
  const bullet = isGeekMode ? 'text-[#4a8fa8]' : 'text-gray-500';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/70 border border-[#2a5060]/50'
    : 'bg-[#141428]/70 border border-gray-700/40';

  return (
    <section id="publications" className="py-20 relative">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-10 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Publications
        </motion.h2>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          {PUBLICATIONS.map(pub => (
            <motion.div key={pub.id} variants={fadeInUp} className={`rounded-xl p-6 ${surface}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                <p className={`font-semibold text-base leading-snug max-w-xl ${accent}`}>
                  {pub.title}
                </p>
                <span className={`text-xs font-semibold uppercase tracking-widest shrink-0 px-2.5 py-1 rounded-md border ${
                  isGeekMode
                    ? 'bg-[#0a1a22] border-[#2a5060]/60 text-[#4a8fa8]'
                    : 'bg-[#1a1a30] border-gray-700/50 text-[#818cf8]'
                }`}>
                  {pub.venue} · {pub.year}
                </span>
              </div>
              <ul className="space-y-2">
                {pub.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className={`mt-[3px] shrink-0 text-xs ${bullet}`}>▸</span>
                    <span className={body}>{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
