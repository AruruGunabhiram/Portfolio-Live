import type { ReactNode } from 'react';

export type StoryStatusVariant = 'warning' | 'success' | 'neutral';

interface StoryStatusProps {
  variant: StoryStatusVariant;
  label: string;
  detail?: string;
  icon?: ReactNode;
}

const classMap: Record<StoryStatusVariant, string> = {
  warning: 'story-status--warning',
  success: 'story-status--success',
  neutral: 'story-node--neutral',
};

/**
 * Status badge — meaning conveyed by text + variant, not color alone.
 * Includes textual label and optional detail.
 */
export function StoryStatus({ variant, label, detail, icon }: StoryStatusProps) {
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${classMap[variant]}`.trim()}
      style={{
        border: variant === 'neutral' ? `1px solid var(--border)` : undefined,
        background: variant === 'neutral' ? 'var(--surface)' : undefined,
        borderRadius: variant === 'neutral' ? '6px' : undefined,
      }}
    >
      <span aria-hidden="true">{icon ?? (isWarning ? '⚠' : isSuccess ? '✓' : '•')}</span>
      <span>{label}</span>
      {detail && (
        <span className="sr-only"> — {detail}</span>
      )}
      {detail && (
        <span aria-hidden="true" className="font-normal" style={{ color: 'var(--text-muted)' }}>
          {detail}
        </span>
      )}
    </span>
  );
}
