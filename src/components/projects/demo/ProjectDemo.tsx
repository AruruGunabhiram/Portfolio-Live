import type { ProjectDemo as ProjectDemoType } from '../../../types/portfolio';
import { FlowDemo } from './FlowDemo';

function isFlowDemo(demo: ProjectDemoType): demo is Extract<ProjectDemoType, { type: 'flow' }> {
  return (demo as { type: string }).type === 'flow' && Array.isArray((demo as { steps?: unknown }).steps);
}

function isMediaDemo(demo: ProjectDemoType): demo is Extract<ProjectDemoType, { type: 'media' }> {
  return (demo as { type: string }).type === 'media' && typeof (demo as { src?: unknown }).src === 'string';
}

export function ProjectDemo({ demo }: { demo: ProjectDemoType }) {
  if (isFlowDemo(demo)) {
    // basic validation — dev only, no Zod
    if (demo.steps.length < 2) return null;
    const ids = new Set(demo.steps.map(s => s.id));
    if (ids.size !== demo.steps.length) {
      if (import.meta.env.DEV) console.warn('[ProjectDemo] duplicate step ids', demo.steps);
      return null;
    }
    if (demo.connections) {
      for (const c of demo.connections) {
        if (!ids.has(c.from) || !ids.has(c.to)) {
          if (import.meta.env.DEV) console.warn('[ProjectDemo] invalid connection', c);
          return null;
        }
      }
    }
    return <FlowDemo demo={demo} />;
  }

  if (isMediaDemo(demo)) {
    // Phase 7 reserves media infrastructure — lazy, muted, poster aware.
    // No fake asset added in Phase 7; SocialLens uses flow only.
    return (
      <div className="rounded-md border overflow-hidden" style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
        <video
          src={demo.src}
          poster={demo.poster}
          muted
          playsInline
          loop
          preload="metadata"
          aria-label={demo.alt ?? demo.ariaLabel ?? 'Project media'}
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>
    );
  }

  // LegacyProjectDemo or unsupported — render nothing, no placeholder (7AO)
  return null;
}
