import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = memo(({ children, className = '' }: CardProps) => {
  return (
    <motion.div
      className={`rounded-md p-6 transition-colors ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
    >
      {children}
    </motion.div>
  );
});
