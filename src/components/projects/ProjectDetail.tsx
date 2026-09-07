import type { Project } from '../../types/portfolio';

const categoryLabel: Record<string, string> = {
  backend: 'Backend',
  'full-stack': 'Full Stack',
  ai: 'AI',
  'developer-tools': 'Developer Tools',
  desktop: 'Desktop',
  'browser-extension': 'Browser Extension',
};

function humanCategory(c: string) {
  return categoryLabel[c] ?? c;
}

export function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <section
      className="mt-4 rounded-md border p-4 sm:p-6 min-w-0 overflow-hidden"
      style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
      aria-label={`${project.title} details`}
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">
          <h4 className="text-base font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {project.title}
          </h4>
          <p className="text-xs font-medium uppercase tracking-[0.08em] mt-1" style={{ color: 'var(--accent)' }}>
            {project.subtitle}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {project.categories.map(humanCategory).join(' · ')}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={`Close ${project.title} details`}
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 min-w-[32px] min-h-[32px] rounded-md border text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <p className="text-sm leading-relaxed mt-4 max-w-prose" style={{ color: 'var(--text-secondary)' }}>
        {project.summary}
      </p>

      {project.highlights.length > 0 && (
        <div className="mt-5">
          <h5 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Highlights
          </h5>
          <ul className="mt-2 space-y-2">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
                <span style={{ color: 'var(--text-secondary)' }}>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 min-w-0">
        <h5 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
          Technologies
        </h5>
        <p className="text-sm mt-1.5 leading-relaxed break-words" style={{ color: 'var(--text-secondary)', overflowWrap: 'anywhere' as const }}>
          {project.technologies.join(' · ')}
        </p>
      </div>

      {project.caseStudy && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <h5 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Case study
          </h5>
          <p className="text-sm leading-relaxed mt-2 italic" style={{ color: 'var(--text-muted)' }}>
            {project.caseStudy.oneLiner}
          </p>
          <div className="mt-4 space-y-4">
            {project.caseStudy.sections.map(sec => (
              <div key={sec.heading}>
                <h6 className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text)' }}>
                  {sec.heading}
                </h6>
                {sec.content && (
                  <p className="text-sm leading-relaxed mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {sec.content}
                  </p>
                )}
                {sec.bullets && (
                  <ul className="mt-2 space-y-1.5">
                    {sec.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2 text-sm leading-relaxed">
                        <span className="mt-[7px] w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
                        <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {project.architecture?.summary && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <h5 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Architecture
          </h5>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
            {project.architecture.summary}
          </p>
        </div>
      )}

      {(project.links.github || project.links.live || project.links.paper || project.links.documentation) && (
        <div className="mt-6 pt-5 border-t flex flex-wrap gap-3" style={{ borderColor: 'var(--border)' }}>
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} repository on GitHub`}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              GitHub <span aria-hidden="true">→</span>
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} live demo`}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Live <span aria-hidden="true">→</span>
            </a>
          )}
          {project.links.paper && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View paper for ${project.title}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Paper <span aria-hidden="true">→</span>
            </a>
          )}
          {project.links.documentation && (
            <a
              href={project.links.documentation}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View documentation for ${project.title}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Docs <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
