import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { PROJECT_STORY_COMPONENTS } from './storyRegistry';
import { getStoryPresentation } from './storyPresentation';

/**
 * Lazy boundary for project visual worlds.
 *
 * Three guarantees:
 *  1. Story code is only requested when the surface approaches the viewport —
 *     featured position alone never triggers a download.
 *  2. A failed chunk degrades to `fallback`; project content is never blocked.
 *  3. The skeleton reserves the story's height so nothing shifts on arrival.
 */

const NEAR_VIEWPORT_MARGIN = '300px 0px';

/** Mount gate — true once the container is within rootMargin of the viewport. */
function useNearViewport(ref: React.RefObject<HTMLElement | null>, rootMargin: string): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    // Environments without IntersectionObserver render eagerly rather than never.
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setNear(true);
          obs.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}

/**
 * Height-stable placeholder. No spinner, no artificial delay.
 * The project-specific CSS variables come from presentation metadata, so deep,
 * medium and light stories reserve their own measured space without coupling the
 * registry to a story implementation.
 */
function StorySkeleton({ projectId }: { projectId: string }) {
  return (
    <div
      aria-hidden="true"
      data-story-skeleton={projectId}
      className="story-grid rounded-md border min-w-0"
      style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
    />
  );
}

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class StoryErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('[ProjectStory] visual failed to load', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface ProjectStoryProps {
  projectId: string;
  /** Rendered when no story is registered or the chunk fails. */
  fallback?: ReactNode;
}

export function ProjectStory({ projectId, fallback = null }: ProjectStoryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, NEAR_VIEWPORT_MARGIN);
  const Story = PROJECT_STORY_COMPONENTS[projectId];
  const presentation = getStoryPresentation(projectId);

  if (!Story || !presentation) return <>{fallback}</>;

  const presentationStyle = {
    '--story-height-compact': `${presentation.compactHeight}px`,
    '--story-height-tablet': `${presentation.tabletHeight}px`,
    '--story-height-desktop': `${presentation.desktopHeight}px`,
  } as CSSProperties;

  const skeleton = <StorySkeleton projectId={projectId} />;

  return (
    <div
      ref={ref}
      className="project-story min-w-0"
      data-project-story={projectId}
      data-story-density={presentation.density}
      style={presentationStyle}
    >
      <StoryErrorBoundary fallback={fallback ?? skeleton}>
        {near ? (
          <Suspense fallback={skeleton}>
            <Story />
          </Suspense>
        ) : (
          skeleton
        )}
      </StoryErrorBoundary>
    </div>
  );
}
