import type { ReactNode } from 'react';

export type StoryNodeVariant = 'ai' | 'backend' | 'database' | 'cloud' | 'automation' | 'neutral';

interface StoryNodeProps {
  variant?: StoryNodeVariant;
  subtle?: boolean;
  label: string;
  detail?: string;
  state?: 'active' | 'completed' | 'idle';
  children?: ReactNode;
  className?: string;
}

const variantClass: Record<StoryNodeVariant, string> = {
  ai: 'story-node--ai',
  backend: 'story-node--backend',
  database: 'story-node--database',
  cloud: 'story-node--cloud',
  automation: 'story-node--automation',
  neutral: 'story-node--neutral',
};

/**
 * Presentational node — left-border accent via A1 tokens.
 * Not interactive, not tabbable. State only affects border/indicator, not color-alone meaning.
 */
export function StoryNode({ variant = 'neutral', subtle = false, label, detail, state, children, className = '' }: StoryNodeProps) {
  const stateColor = state === 'active' ? 'var(--accent)' : state === 'completed' ? 'var(--accent)' : 'var(--border-strong)';
  const isActive = state === 'active';
  const isCompleted = state === 'completed';

  return (
    <div
      className={`story-node ${variantClass[variant]} ${className}`.trim()}
      data-variant={subtle ? 'subtle' : undefined}
      style={{
        background: isCompleted && !isActive ? 'var(--accent-subtle)' : subtle ? undefined : 'var(--surface)',
        borderColor: isActive ? 'var(--border-strong)' : 'var(--border)',
        overflowWrap: 'anywhere' as const,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          aria-hidden="true"
          style={{
            background: stateColor,
            opacity: state === 'idle' ? 0.5 : isActive ? 1 : 0.9,
          }}
        />
        <p className="text-xs font-semibold leading-snug break-words min-w-0" style={{ color: isActive || isCompleted ? 'var(--text)' : 'var(--text-muted)', overflowWrap: 'anywhere' as const }}>
          {label}
        </p>
      </div>
      {detail && (
        <p className="text-[11px] leading-snug mt-1 break-words" style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}>
          {detail}
        </p>
      )}
      {children}
    </div>
  );
}
