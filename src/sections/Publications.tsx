import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { PUBLICATIONS } from '../data/publications';

export const Publications = () => {
  return (
    <section id="publications" className="py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Publications
        </motion.h2>

        <motion.div className="space-y-4" initial="hidden" whileInView="visible" viewport={scrollViewport} variants={staggerContainer}>
          {PUBLICATIONS.map(pub => (
            <motion.div
              key={pub.id}
              variants={fadeInUp}
              className="rounded-md p-4 sm:p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                <p className="font-semibold text-base leading-snug max-w-xl" style={{ color: 'var(--text)' }}>{pub.title}</p>
                <span
                  className="text-xs font-semibold uppercase tracking-widest shrink-0 px-2.5 py-1 rounded-md border"
                  style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  {pub.venue} · {pub.year}
                </span>
              </div>
              <ul className="space-y-2">
                {pub.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-[3px] shrink-0 text-xs" style={{ color: 'var(--accent)' }}>▸</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{h}</span>
                  </li>
                ))}
              </ul>
              {pub.paperUrl && (
                <a
                  href={pub.paperUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs font-medium mt-4 link-accent"
                >
                  View Paper →
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
