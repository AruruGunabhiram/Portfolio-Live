import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks';
import { hoverScale, tapScale } from '../../utils';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const { isGeekMode } = useTheme();

  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-colors duration-200';

  const variantStyles = {
    primary: isGeekMode
      ? 'bg-geek-accent text-geek-bg hover:bg-geek-text border border-geek-accent'
      : 'bg-dark-accent text-white hover:bg-blue-500',
    secondary: isGeekMode
      ? 'border border-geek-accent text-geek-accent hover:bg-geek-accent hover:text-geek-bg'
      : 'border border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-white',
    ghost: isGeekMode
      ? 'text-geek-accent hover:bg-geek-accent/10'
      : 'text-gray-300 hover:bg-dark-surface',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={hoverScale}
      whileTap={tapScale}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
