import { useEffect, useRef } from 'react';
import Vivus from 'vivus';
import { isBrowser } from '../../utils';

interface AnimatedLogoProps {
  className?: string;
}

export const AnimatedLogo = ({ className = '' }: AnimatedLogoProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const vivusRef = useRef<Vivus | null>(null);

  useEffect(() => {
    if (!isBrowser || !svgRef.current) return;

    const svgElement = svgRef.current;

    // Add an ID if it doesn't have one
    if (!svgElement.id) {
      svgElement.id = `animated-logo-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Initialize Vivus animation with element ID
    vivusRef.current = new Vivus(
      svgElement.id,
      {
        duration: 200, // 2 seconds
        type: 'oneByOne',
        animTimingFunction: Vivus.EASE,
        start: 'autostart',
      }
    );

    // Cleanup
    return () => {
      if (vivusRef.current) {
        vivusRef.current.destroy();
        vivusRef.current = null;
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className={className}
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon outline */}
      <path
        d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner triangle */}
      <path
        d="M 50 30 L 70 60 L 30 60 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Center dot */}
      <circle
        cx="50"
        cy="50"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Lines connecting to center */}
      <line x1="50" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
      <line x1="70" y1="60" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="60" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};
