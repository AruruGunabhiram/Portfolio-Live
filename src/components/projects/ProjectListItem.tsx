import type { Project } from '../../types/portfolio';

const LABEL: Record<string, string> = {
  backend: 'Backend',
  'full-stack': 'Full Stack',
  ai: 'AI',
  'developer-tools': 'Developer Tools',
  desktop: 'Desktop',
  'browser-extension': 'Browser Extension',
};

function formatTechs(techs: string[], max = 3) {
  if (techs.length <= max) return techs.join(' · ');
  return `${techs.slice(0, max).join(' · ')} · +${techs.length - max}`;
}

export function ProjectListItem({
  project,
  isExpanded,
  onToggle,
}: {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cats = project.categories.map(c => LABEL[c] ?? c).join(' · ');
  return (
    <article className="py-5 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {project.title}
          </h3>
          <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
            {project.subtitle}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {formatTechs(project.technologies)} <span aria-hidden="true">·</span> {cats}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={`detail-${project.id}`}
          className="shrink-0 text-xs font-medium underline-offset-4 hover:underline"
          style={{ color: isExpanded ? 'var(--accent)' : 'var(--text-secondary)' }}
        >
          {isExpanded ? 'Hide' : 'View details →'}
        </button>
      </div>

      {/* Links row — compact, only if needed separate from detail */}
      {(project.links.github || project.links.live) && !isExpanded && (
        <div className="mt-3 flex gap-3">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="text-xs underline-offset-4 hover:underline" style={{ color: 'var(--text-muted)' }}>
              GitHub
            </a>
          )}
          {project.links.live && (
            <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="text-xs underline-offset-4 hover:underline" style={{ color: 'var(--text-muted)' }}>
              Live
            </a>
          )}
        </div>
      )}
    </article>
  );
}
