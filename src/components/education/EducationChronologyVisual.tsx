import { motion } from 'framer-motion';
import { EDUCATION } from '../../data/education';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A17 — Education chronology.
 *
 * Derived entirely from canonical EDUCATION `period` strings. No GPA, coursework,
 * research group or completion percentage is synthesised here: the rail shows the
 * real start and end years and nothing else. A degree whose end year is still ahead
 * of the current year is labelled "in progress" — plain chronology, not a progress
 * metric.
 *
 * Decorative by construction: every string it renders is already present in the
 * Education list below it, so the whole block is aria-hidden.
 */

const NOW_YEAR = new Date().getFullYear();

const SEGMENTS = EDUCATION.map(entry => {
  const years = entry.period.match(/\d{4}/g) ?? [];
  const [start, end] = years;
  return {
    id: entry.id,
    // degree level only ("MS" / "BS") — the full degree string is already rendered
    // in the list below, so the rail labels it without repeating it verbatim.
    level: entry.degree.split(' ')[0],
    start: start ?? '',
    end: end ?? '',
    ongoing: end ? Number(end) > NOW_YEAR : false,
  };
})
  .filter(seg => seg.start && seg.end)
  .sort((a, b) => Number(a.start) - Number(b.start));

const track = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } },
};

const rail = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.62, ease: 'easeOut' as const } },
};

const fade = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const, delay: 0.34 } },
};

export function EducationChronologyVisual() {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isStatic = isReduced;

  // Recruiter mode is proof-scanning: the rail only restates the canonical period
  // strings already in the list, so it is dropped entirely rather than shown static.
  if (isRecruiter || !SEGMENTS.length) return null;

  const animate = isStatic ? undefined : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, amount: 0.4 } };

  return (
    <motion.div className="edu-chrono" aria-hidden="true" variants={track} {...animate}>
      <p className="edu-chrono__eyebrow">Academic chronology</p>

      <div className="edu-chrono__track">
        {SEGMENTS.map(seg => (
          <div key={seg.id} className="edu-chrono__seg">
            <div className="edu-chrono__rail-row">
              <span className="edu-chrono__cap" />
              <motion.span
                className="edu-chrono__rail"
                data-ongoing={seg.ongoing ? '' : undefined}
                variants={isStatic ? undefined : rail}
              />
              <span className="edu-chrono__cap" data-open={seg.ongoing ? '' : undefined} />
            </div>

            <motion.div className="edu-chrono__meta" variants={isStatic ? undefined : fade}>
              <div className="edu-chrono__years">
                <span>{seg.start}</span>
                <span>{seg.end}</span>
              </div>
              <p className="edu-chrono__degree">{seg.level}</p>
              {seg.ongoing && <p className="edu-chrono__state">in progress</p>}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
