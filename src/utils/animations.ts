import type { Variants } from 'framer-motion';

// ============================================
// FRAMER MOTION VARIANTS
// ============================================

/**
 * Fade in animation
 * Usage: <motion.div variants={fadeIn} initial="hidden" animate="visible">
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Fade in with upward slide
 * Usage: <motion.div variants={fadeInUp} initial="hidden" animate="visible">
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Fade in with downward slide
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale up animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Container variant for stagger children animations
 * Usage with children that have their own variants:
 * <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *   <motion.div variants={fadeInUp}>Child 1</motion.div>
 *   <motion.div variants={fadeInUp}>Child 2</motion.div>
 * </motion.div>
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fast stagger for multiple items
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Scroll-triggered animation variants
 * Use with whileInView prop
 */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
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

// ============================================
// ANIMATION PRESETS
// ============================================

/**
 * Hero section animation configuration
 */
export const heroAnimation = {
  container: staggerContainer,
  heading: {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  } as Variants,
  subheading: fadeInUp,
  description: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  } as Variants,
  cta: fadeInUp,
};

/**
 * Card animation for project/skill items
 */
export const cardAnimation: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Hover animation for interactive elements
 */
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.2,
  },
};

/**
 * Tap animation for buttons
 */
export const tapScale = {
  scale: 0.95,
};
