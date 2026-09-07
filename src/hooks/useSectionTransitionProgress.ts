import { useScroll, useMotionValue, type MotionValue } from 'framer-motion';
import { useReducedMotion, useIsCompactStory } from './useStoryLifecycle';
import { usePortfolioMode } from '../context/PortfolioModeContext';

/**
 * Bounded progress for the Hero → Experience signature transition.
 * Uses Framer Motion's MotionValues — no React state per scroll frame,
 * no global scroll manager, no hijacking.
 *
 * Returns a MotionValue in [0,1] that advances only while the bounded
 * window around the Hero/Experience boundary scrolls through the viewport.
 *
 * Bypassed entirely for recruiter and reduced-motion (returns static 0).
 */
export function useHeroExperienceProgress(
  targetRef: React.RefObject<HTMLElement | null>,
  opts?: { isCompact?: boolean }
): MotionValue<number> {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const compactFromHook = useIsCompactStory(1024);
  const compact = opts?.isCompact ?? compactFromHook;
  // Desktop: Hero bottom 0.85→0.15 covers ~70% viewport around boundary.
  // Compact: slightly narrower window, less motion distance.
  const offset = (compact
    ? ['start 0.88', 'end 0.22']
    : ['end 0.88', 'end 0.12']) as unknown as [string, string];

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: offset as unknown as never,
  });

  const staticZero = useMotionValue(0);
  const shouldBypass = isRecruiter || isReduced;

  // When bypassed, consumers receive static 0 — no transforms applied.
  // We don't conditionally skip useScroll (hooks must be unconditional), but we ignore its value.
  if (shouldBypass) return staticZero;

  return scrollYProgress;
}

/** Experience entry uses its own target (top of Experience) */
export function useExperienceEntryProgress(
  targetRef: React.RefObject<HTMLElement | null>
): MotionValue<number> {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.88', 'start 0.32'] as unknown as never,
  });
  const staticZero = useMotionValue(0);
  if (isRecruiter || isReduced) return staticZero;
  return scrollYProgress;
}

/**
 * Bounded progress for Experience → Projects capability recomposition.
 * Natural boundary, no pinning. Short window around Experience bottom / Projects top.
 * Bypassed for recruiter/reduced-motion (static 0).
 */
export function useExperienceProjectsProgress(
  targetRef: React.RefObject<HTMLElement | null>
): MotionValue<number> {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isCompact = useIsCompactStory(1024);
  const offset = (isCompact ? ['start 0.88', 'start 0.28'] : ['start 0.85', 'start 0.25']) as unknown as [string, string];
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: offset as unknown as never,
  });
  const staticZero = useMotionValue(0);
  if (isRecruiter || isReduced) return staticZero;
  return scrollYProgress;
}

/**
 * Experience exit emphasis — the professional story visuals reduce emphasis as the
 * section bottom leaves, so the capability modules read as a recomposition of them.
 * Same bounded-window pattern as A4; only visual-story objects consume it.
 * Factual content (bullets, company, chronology) never consumes this value.
 */
export function useExperienceExitProgress(
  targetRef: React.RefObject<HTMLElement | null>
): MotionValue<number> {
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['end 0.95', 'end 0.4'] as unknown as never,
  });
  const staticZero = useMotionValue(0);
  if (isRecruiter || isReduced) return staticZero;
  return scrollYProgress;
}
