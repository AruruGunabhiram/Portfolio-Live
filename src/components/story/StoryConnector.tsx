interface StoryConnectorProps {
  active?: boolean;
  orientation?: 'vertical' | 'horizontal';
  label?: string;
  /** Shorter run — used by compact stacks where vertical space is expensive. */
  dense?: boolean;
}

/**
 * Decorative connector — aria-hidden by default.
 * Uses A1 tokens, not arrow characters. SVG provides accessible fallback if needed.
 */
export function StoryConnector({ active = false, orientation = 'vertical', label, dense = false }: StoryConnectorProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-1 py-1" aria-hidden="true">
        <div
          className="h-px w-6 transition-colors"
          style={{ background: active ? 'var(--accent)' : 'var(--border-strong)', opacity: active ? 0.9 : 0.5 }}
        />
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" style={{ display: 'block', color: active ? 'var(--accent)' : 'var(--border-strong)', opacity: active ? 0.9 : 0.5 } as React.CSSProperties}>
          <path d="M0 4 H6 M4 2 L6 4 L4 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }
  return (
    <div className={`flex flex-col items-center ${dense ? '' : 'py-1'}`} aria-hidden="true">
      <div
        className={`w-px transition-colors ${dense ? 'h-2' : 'h-5'}`}
        style={{ background: active ? 'var(--accent)' : 'var(--border-strong)', opacity: active ? 0.9 : 0.5 }}
      />
      <svg width={dense ? 7 : 8} height={dense ? 7 : 8} viewBox="0 0 8 8" aria-hidden="true" style={{ display: 'block', marginTop: dense ? 1 : 2, color: active ? 'var(--accent)' : 'var(--border-strong)', opacity: active ? 0.9 : 0.5 } as React.CSSProperties}>
        <path d="M4 0 V6 M2 4 L4 6 L6 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
