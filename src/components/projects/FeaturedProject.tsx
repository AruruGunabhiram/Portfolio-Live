import type { Project } from '../../types/portfolio';
import { ProjectDemo } from './demo/ProjectDemo';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

const CATEGORY_LABEL: Record<string, string> = {
  backend: 'Backend',
  'full-stack': 'Full Stack',
  ai: 'AI',
  'developer-tools': 'Developer Tools',
  desktop: 'Desktop',
  'browser-extension': 'Browser Extension',
};

function formatTechs(techs: string[], max = 5) {
  if (techs.length <= max) return techs.join(' · ');
  return `${techs.slice(0, max).join(' · ')} · +${techs.length - max}`;
}

export function FeaturedProject({
  project,
  index,
  isExpanded,
  onToggle,
  detailId,
}: {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  detailId?: string;
}) {
  const cats = project.categories.map(c => CATEGORY_LABEL[c] ?? c).join(' · ');
  const hasDemo = !!project.demo;
  const { isRecruiter } = usePortfolioMode();
  const flowSummary =
    hasDemo && project.demo!.type === 'flow' && 'steps' in project.demo!
      ? (project.demo as { steps: { label: string }[] }).steps.map(s => s.label).join(' → ')
      : null;

  return (
    <article className="py-7 sm:py-8">
      <div className={hasDemo ? 'grid lg:grid-cols-[1.15fr_340px] gap-6 lg:gap-8 items-start' : 'flex items-start justify-between gap-4'}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] tracking-[0.12em] uppercase font-medium" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ color: 'var(--text-muted)' }}>
              {cats}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold leading-tight mt-2 tracking-tight" style={{ color: 'var(--text)' }}>
            {project.title}
          </h3>
          <p className="text-xs font-medium uppercase tracking-[0.08em] mt-1" style={{ color: 'var(--accent)' }}>
            {project.subtitle}
          </p>

          <p className="text-sm leading-relaxed mt-3 max-w-[60ch]" style={{ color: 'var(--text-secondary)' }}>
            {project.summary}
          </p>

          <ul className="mt-4 space-y-2">
            {project.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
                <span style={{ color: 'var(--text-secondary)' }}>{h}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs mt-4 break-words" style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}>
            {formatTechs(project.technologies)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-controls={detailId ?? `detail-${project.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium border rounded-md px-3.5 py-2 transition-colors focus-visible:outline-none min-h-[40px]"
              style={
                isExpanded
                  ? {
                      background: 'var(--accent-button)',
                      borderColor: 'var(--accent-button)',
                      color: '#fff',
                    }
                  : {
                      background: 'transparent',
                      borderColor: 'var(--border-strong)',
                      color: 'var(--text)',
                    }
              }
            >
              {isExpanded ? 'Hide details' : 'View details'}
              <span aria-hidden="true" className="transition-transform" style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ↓
              </span>
            </button>

            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                GitHub <span aria-hidden="true">→</span>
              </a>
            )}
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Live <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>

        {hasDemo && (
          <div className="min-w-0">
            {/* Recruiter mobile: compact flow text instead of full demo (17AE) */}
            {isRecruiter && flowSummary ? (
              <>
                <p
                  className="sm:hidden text-xs leading-relaxed rounded-md border px-3 py-2.5"
                  style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {flowSummary}
                </p>
                <div className="hidden sm:block">
                  <ProjectDemo demo={project.demo!} />
                </div>
              </>
            ) : (
              <ProjectDemo demo={project.demo!} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
