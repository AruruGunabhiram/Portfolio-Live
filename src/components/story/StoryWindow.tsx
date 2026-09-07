import type { ReactNode } from 'react';

interface StoryWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Technical window surface — optional title bar, no fake browser chrome.
 * Uses --surface-raised, --border, restrained shadow.
 */
export function StoryWindow({ title, children, className = '' }: StoryWindowProps) {
  return (
    <div className={`story-window min-w-0 ${className}`.trim()}>
      {title && (
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-subtle)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
          <span className="text-[11px] font-medium ml-2 truncate" style={{ color: 'var(--text-muted)' }}>
            {title}
          </span>
        </div>
      )}
      <div className="p-3 sm:p-4 min-w-0">{children}</div>
    </div>
  );
}
