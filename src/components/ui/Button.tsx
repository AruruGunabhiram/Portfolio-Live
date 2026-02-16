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

  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200';

  const variantStyles = {
    primary: isGeekMode
      ? 'bg-cyber-cyan text-cyber-bg-dark border border-cyber-cyan glow-cyan hover:glow-pink hover:bg-cyber-pink hover:border-cyber-pink'
      : 'bg-dark-accent text-white hover:bg-blue-500',
    secondary: isGeekMode
      ? 'border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-pink hover:text-cyber-pink glow-cyan hover:glow-pink'
      : 'border border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-white',
    ghost: isGeekMode
      ? 'text-cyber-cyan hover:bg-cyber-cyan/10 hover:text-cyber-pink'
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

Button.displayName = 'Button';
