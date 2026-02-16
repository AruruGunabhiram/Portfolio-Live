import { memo } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { useTheme } from '../../hooks';
import { hoverScale, tapScale } from '../../utils';

type MotionButtonProps = Omit<MotionProps, 'children'>;
type HTMLButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>;

interface ButtonProps extends HTMLButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = memo(({
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

  const motionProps: MotionButtonProps = {
    whileHover: hoverScale,
    whileTap: tapScale,
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
});
