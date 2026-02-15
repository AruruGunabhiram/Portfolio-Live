import { Parallax } from 'react-scroll-parallax';
import { prefersReducedMotion } from '../../utils';
import type { ReactNode } from 'react';

interface ParallaxLayerProps {
  speed?: number;
  children: ReactNode;
  className?: string;
}

export const ParallaxLayer = ({
  speed = -10,
  children,
  className = ''
}: ParallaxLayerProps) => {
  // Disable parallax if user prefers reduced motion
  const shouldAnimate = !prefersReducedMotion();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Parallax speed={speed} className={className}>
      {children}
    </Parallax>
  );
};
