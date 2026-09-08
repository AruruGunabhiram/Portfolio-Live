import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A17 — publication as documented evidence.
 *
 * Pure geometry: a settling stack of sheets with abstract rule lines. It asserts
 * no venue, citation count, indexing status or authorship — the canonical
 * publication text beside it carries every claim. aria-hidden, no tab stop.
 */

const stack = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};

const sheet = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: 'easeOut' as const } },
};

const lines = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const, delay: 0.5 } },
};

export function PublicationEvidenceVisual() {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isStatic = isRecruiter || isReduced;

  if (isRecruiter) return null;

  const animate = isStatic ? undefined : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, amount: 0.5 } };

  return (
    <motion.div className="pub-doc" aria-hidden="true" variants={stack} {...animate}>
      <motion.span className="pub-doc__sheet" data-depth="2" variants={isStatic ? undefined : sheet} />
      <motion.span className="pub-doc__sheet" data-depth="1" variants={isStatic ? undefined : sheet} />
      <motion.div className="pub-doc__sheet pub-doc__sheet--front" variants={isStatic ? undefined : sheet}>
        <motion.span className="pub-doc__lines" variants={isStatic ? undefined : lines}>
          <span className="pub-doc__line" data-w="full" />
          <span className="pub-doc__line" data-w="full" />
          <span className="pub-doc__line" data-w="short" />
          <span className="pub-doc__rule" />
          <span className="pub-doc__line" data-w="mid" />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
