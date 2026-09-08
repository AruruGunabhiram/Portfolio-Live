import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A19 — outreach as connection, not hierarchy.
 *
 * A role marker at the centre, community nodes around it, links resolving
 * outward, and two faint reach arcs. Deliberately not an org chart: no
 * levels, no direction of authority, no ranking between the outer nodes.
 *
 * Renders no text and no numbers, so it cannot imply an event count, a
 * headcount, a budget or any other unverified impact figure. Decorative:
 * aria-hidden, focusable false, pointer-events none, zero tab stops.
 */

// Community nodes — evenly weighted, no node is "senior" to another.
const NODES = [
  { x: 48, y: 58 },
  { x: 212, y: 56 },
  { x: 62, y: 140 },
  { x: 198, y: 138 },
];

const CX = 130;
const CY = 96;

export function LeadershipOutreachVisual() {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isStatic = isRecruiter || isReduced;

  const view = { once: true, amount: 0.4 };
  // Static modes render the settled end state directly — no entrance at all.
  const at = (delay: number, duration: number) =>
    isStatic ? { duration: 0 } : { duration, delay, ease: 'easeOut' as const };

  return (
    <div aria-hidden="true" data-scene="leadership-outreach" className="w-full max-w-[200px]" style={{ pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 260 170"
        width="100%"
        role="presentation"
        focusable="false"
        style={{ display: 'block', height: 'auto' }}
      >
        {/* Links — drawn after the nodes they join */}
        {NODES.map((n, i) => (
          <motion.line
            key={`l${i}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            stroke="var(--border-strong)"
            strokeWidth="1.25"
            initial={isStatic ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.9 }}
            viewport={view}
            transition={at(0.85 + i * 0.11, 0.4)}
          />
        ))}

        {/* Reach arcs — outreach, held faint so they read as atmosphere */}
        {[44, 70].map((r, i) => (
          <motion.circle
            key={`a${r}`}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="2 6"
            initial={isStatic ? false : { opacity: 0 }}
            whileInView={{ opacity: 0.28 - i * 0.1 }}
            viewport={view}
            transition={at(1.45 + i * 0.16, 0.45)}
          />
        ))}

        {/* Community nodes */}
        {NODES.map((n, i) => (
          <motion.circle
            key={`n${i}`}
            cx={n.x}
            cy={n.y}
            r="6"
            fill="var(--surface)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            initial={isStatic ? false : { opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={view}
            transition={at(0.42 + i * 0.13, 0.34)}
          />
        ))}

        {/* Role marker */}
        <motion.g
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          initial={isStatic ? false : { opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={view}
          transition={at(0, 0.42)}
        >
          <circle cx={CX} cy={CY} r="16" fill="none" stroke="var(--accent)" strokeWidth="1.25" opacity="0.5" />
          <circle cx={CX} cy={CY} r="9" fill="var(--accent)" />
        </motion.g>
      </svg>
    </div>
  );
}
