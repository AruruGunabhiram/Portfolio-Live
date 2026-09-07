import { motion } from 'framer-motion';

interface StoryPacketProps {
  shouldAnimate: boolean;
  label?: string;
  size?: number;
}

/**
 * Small moving-data representation.
 * When shouldAnimate is false, renders static dot at start (no motion).
 * Decorative by default — aria-hidden.
 */
export function StoryPacket({ shouldAnimate, label, size = 6 }: StoryPacketProps) {
  if (!shouldAnimate) {
    return (
      <span
        aria-hidden="true"
        className="inline-block rounded-full"
        style={{ width: size, height: size, background: 'var(--accent)', opacity: 0.85 }}
      >
        {label && <span className="sr-only">{label}</span>}
      </span>
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: 'var(--accent)' } as React.CSSProperties}
      initial={{ opacity: 0.7, x: 0 }}
      animate={{ opacity: [0.7, 1, 0.7], x: [0, 8, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {label && <span className="sr-only">{label}</span>}
    </motion.span>
  );
}
