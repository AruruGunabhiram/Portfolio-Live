import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = memo(({ children, className = '' }: CardProps) => {
  const { isGeekMode } = useTheme();

  const cardStyles = isGeekMode
    ? 'border border-geek-accent bg-geek-bg hover:border-geek-text'
    : 'bg-dark-surface border border-gray-800 hover:border-dark-accent';

  return (
    <motion.div
      className={`rounded-lg p-6 transition-all duration-200 ${cardStyles} ${className}`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
});
