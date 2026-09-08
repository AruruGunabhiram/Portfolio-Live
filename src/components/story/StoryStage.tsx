import type { ReactNode } from 'react';

interface StoryStageProps {
  children: ReactNode;
  ariaLabel: string;
  description?: string;
  withGrid?: boolean;
  className?: string;
  id?: string;
}

/**
 * Reusable visual-story container.
 * - No fixed dimensions, responsive, min-width 0
 * - overflow controlled, no layout shift
 * - role=img + aria-label + sr-only description
 * - Decorative children should be aria-hidden themselves
 */
export function StoryStage({ children, ariaLabel, description, withGrid, className = '', id }: StoryStageProps) {
  return (
    <div
      id={id}
      role="img"
      aria-label={ariaLabel}
      className={`rounded-md border p-3 sm:p-5 min-w-0 ${withGrid ? 'story-grid' : ''} ${className}`}
      style={{
        background: 'var(--surface-subtle)',
        borderColor: 'var(--border)',
        minHeight: 'var(--story-reserved-height, 200px)',
        overflowWrap: 'anywhere' as const,
        position: 'relative',
      }}
    >
      {description && <p className="sr-only">{description}</p>}
      {children}
    </div>
  );
}
