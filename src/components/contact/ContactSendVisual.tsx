import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A19 — the closing mark: a message leaves and arrives.
 *
 * Envelope outline → fold → geometric dart → short path → connection mark.
 * One finite ~2.2s sequence, played once when scrolled into view. No loop.
 *
 * Purely decorative: renders no text and no controls, aria-hidden, focusable
 * false, pointer-events none. The real contact actions sit above it.
 * Omitted entirely in recruiter mode; final static state under reduced motion.
 */

const D = 2.2;
const TIMES = [0, 0.22, 0.4, 0.52, 0.67, 0.82, 1];

export function ContactSendVisual() {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();

  if (isRecruiter) return null;

  // Reduced motion collapses every keyframe track to its final value.
  const anim = (values: number[]) => (isReduced ? values[values.length - 1] : values);
  const tr = isReduced ? { duration: 0 } : { duration: D, times: TIMES, ease: 'easeInOut' as const };
  const view = { once: true, amount: 0.6 };

  return (
    <div aria-hidden="true" data-scene="contact-send" className="w-full" style={{ maxWidth: 340, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 340 104"
        width="100%"
        role="presentation"
        focusable="false"
        style={{ display: 'block', height: 'auto' }}
      >
        {/* Envelope — resolves, folds, then hands off */}
        <motion.g
          initial={isReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: anim([0, 1, 1, 0, 0, 0, 0]) }}
          viewport={view}
          transition={tr}
        >
          <rect
            x="24"
            y="34"
            width="72"
            height="46"
            rx="3"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
          <motion.path
            d="M24 34 L96 34 L60 61 Z"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            style={{ transformOrigin: '60px 34px' }}
            initial={isReduced ? false : { scaleY: 0 }}
            whileInView={{ scaleY: anim([0, -1, 1, 1, 1, 1, 1]) }}
            viewport={view}
            transition={tr}
          />
        </motion.g>

        {/* Path taken */}
        <motion.path
          d="M92 57 Q150 34 196 50"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.25"
          strokeDasharray="3 5"
          initial={isReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: anim([0, 0, 0, 0, 0.2, 0.45, 0.45]) }}
          viewport={view}
          transition={tr}
        />

        {/* Geometric dart — what the folded envelope becomes */}
        <motion.path
          d="M80 57 L40 42 L50 57 L40 72 Z"
          fill="var(--accent)"
          opacity="0.75"
          initial={isReduced ? false : { opacity: 0 }}
          whileInView={{
            opacity: anim([0, 0, 0, 0.75, 0.75, 0.75, 0.75]),
            x: anim([0, 0, 0, 0, 78, 152, 152]),
            y: anim([0, 0, 0, 0, -13, 0, 0]),
            rotate: anim([0, 0, 0, -6, -2, 0, 0]),
          }}
          viewport={view}
          transition={tr}
        />

        {/* Connection mark — arrival */}
        <motion.g
          initial={isReduced ? false : { opacity: 0, scale: 0 }}
          whileInView={{
            opacity: anim([0, 0, 0, 0, 0, 0.4, 1]),
            scale: anim([0, 0, 0, 0, 0, 0.4, 1]),
          }}
          viewport={view}
          transition={tr}
          style={{ transformOrigin: '252px 57px' }}
        >
          <circle cx="252" cy="57" r="11" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="252" cy="57" r="3.5" fill="var(--accent)" />
        </motion.g>
      </svg>
    </div>
  );
}
