import type { Variants } from 'framer-motion';

/**
 * Fade in with upward slide — used by EngineeringPractices / About scroll reveals
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
};

// ============================================
// FRAMER MOTION CONFIGURATION
// ============================================

/**
 * Default viewport configuration for scroll animations
 * Usage: <motion.div whileInView="visible" viewport={scrollViewport}>
 */
export const scrollViewport = {
  once: true, // Animate only once
  amount: 0.3, // Trigger when 30% of element is visible
  margin: '0px 0px -100px 0px', // Add offset to trigger point
};

// ============================================
// BROWSER + MOTION UTILITIES
// ============================================

/**
 * Check if we're in a browser environment (SSR-safe)
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (!isBrowser) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};


