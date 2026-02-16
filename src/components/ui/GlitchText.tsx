import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../../utils';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
}

export const GlitchText = ({ children, className = '' }: GlitchTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  const handleMouseEnter = () => {
    if (prefersReducedMotion() || !textRef.current || isGlitching) return;

    setIsGlitching(true);

    const text = textRef.current;
    const originalText = text.textContent || '';

    // Glitch characters
    const glitchChars = '!<>-_\\/[]{}—=+*^?#________';

    // Glitch effect
    const glitchInterval = setInterval(() => {
      if (!text) return;

      const glitchedText = originalText
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          return Math.random() > 0.7
            ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
            : char;
        })
        .join('');

      text.textContent = glitchedText;
    }, 50);

    // Reset after glitch
    const resetTimeout = setTimeout(() => {
      clearInterval(glitchInterval);
      clearInterval(colorInterval);
      if (text) {
        text.textContent = originalText;
        text.style.color = ''; // Reset color
      }
      setIsGlitching(false);
    }, 300);

    // Animate color shift with cyberpunk colors
    const colors = ['#00f0ff', '#ff006e', '#b026ff', '#00f0ff']; // Cyan, Pink, Purple, Cyan
    let colorIndex = 0;
    const colorInterval = setInterval(() => {
      if (text && colorIndex < colors.length) {
        text.style.color = colors[colorIndex];
        colorIndex++;
      }
    }, 75);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(colorInterval);
      clearTimeout(resetTimeout);
    };
  };

  return (
    <span
      ref={textRef}
      className={`glitch-text cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
    >
      {children}
      {/* <style>{`
        .glitch-text {
          text-shadow:
            2px 0 0 rgba(0, 240, 255, 0.3),
            -2px 0 0 rgba(255, 0, 0, 0.3);
          animation: glitch-anim-text 0.3s ease-in-out;
        }

        .glitch-text:hover {
          animation: glitch-anim 0.3s ease-in-out infinite;
        }

        @keyframes glitch-anim {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glitch-text {
            animation: none !important;
            text-shadow: none !important;
          }
        }
      `}</style> */}
    </span>
  );
};
