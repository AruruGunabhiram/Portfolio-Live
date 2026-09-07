import type { ProjectCategory } from '../../types/portfolio';

const LABEL: Record<ProjectCategory, string> = {
  backend: 'Backend',
  'full-stack': 'Full Stack',
  ai: 'AI',
  'developer-tools': 'Developer Tools',
  desktop: 'Desktop',
  'browser-extension': 'Browser Extension',
};

function labelFor(c: ProjectCategory | 'all') {
  if (c === 'all') return 'All';
  return LABEL[c] ?? c;
}

export function ProjectFilters({
  categories,
  selected,
  onSelect,
}: {
  categories: (ProjectCategory | 'all')[];
  selected: ProjectCategory | 'all';
  onSelect: (c: ProjectCategory | 'all') => void;
}) {
  return (
    <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
      {categories.map(cat => {
        const active = selected === cat;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(cat)}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none"
            style={
              active
                ? {
                    background: 'var(--accent-muted)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  }
                : {
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }
            }
          >
            {labelFor(cat)}
          </button>
        );
      })}
    </div>
  );
}
