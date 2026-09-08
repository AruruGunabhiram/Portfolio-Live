import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A17 — certification as verified proof.
 *
 * Code-only credential geometry: a settling frame with corner registration marks
 * and a check indicator. No issuer artwork is reproduced, and it renders no text,
 * so it cannot assert a credential id, score or expiry. aria-hidden, no tab stop.
 *
 * Only mounted by the Certifications section, which returns null while
 * CERTIFICATIONS is empty.
 */

const frame = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const mark = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.36, ease: 'easeOut' as const, delay: 0.62 } },
};

export function CertificationProofVisual() {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isStatic = isRecruiter || isReduced;

  if (isRecruiter) return null;

  const animate = isStatic ? undefined : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true, amount: 0.5 } };

  return (
    <motion.div className="cert-proof" aria-hidden="true" variants={isStatic ? undefined : frame} {...animate}>
      <span className="cert-proof__corner" data-c="tl" />
      <span className="cert-proof__corner" data-c="tr" />
      <span className="cert-proof__corner" data-c="bl" />
      <span className="cert-proof__corner" data-c="br" />
      <motion.span className="cert-proof__mark" variants={isStatic ? undefined : mark}>
        <span className="cert-proof__check" />
      </motion.span>
    </motion.div>
  );
}
