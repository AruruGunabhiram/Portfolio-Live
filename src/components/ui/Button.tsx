import { memo } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';

type MotionButtonProps = Omit<MotionProps, 'children'>;
type HTMLButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
>;

interface ButtonProps extends HTMLButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = memo(({ variant = 'primary', className = '', children, ...props }: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-[var(--motion-normal)] focus-visible:outline-none';

  const variantStyles: Record<string, string> = {
    primary:
      'text-white border border-transparent shadow-sm hover:opacity-[0.96] active:opacity-[0.92] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-transparent border disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent border border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
  };

  // Semantic inline colors to guarantee contrast in both themes
  const styleForVariant = (): React.CSSProperties => {
    if (variant === 'primary') {
      return { background: 'var(--accent)', color: '#ffffff', borderColor: 'var(--accent)' };
    }
    if (variant === 'secondary') {
      return {
        background: 'transparent',
        color: 'var(--text)',
        borderColor: 'var(--border-strong)',
      };
    }
    return {
      background: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    };
  };

  const motionProps: MotionButtonProps = {
    whileHover: { scale: 1.01, transition: { duration: 0.12 } },
    whileTap: { scale: 0.99, transition: { duration: 0.08 } },
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={styleForVariant()}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
