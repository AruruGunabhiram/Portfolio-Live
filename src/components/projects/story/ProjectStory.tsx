import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PROJECT_STORY_COMPONENTS } from './storyRegistry';

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
 * Breakpoints mirror the two things that change the stage's height: the compact
 * composition switches at 768px, and FeaturedProject narrows the visual to a 340px
 * column at 1024px. Measured against the rendered Ember stage so an arriving chunk
 * does not shift the page.
 */
function StorySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-md border min-w-0 min-h-[415px] md:min-h-[592px] lg:min-h-[625px]"
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

  if (!Story) return <>{fallback}</>;

  return (
    <div ref={ref} className="min-w-0">
      <StoryErrorBoundary fallback={fallback ?? <StorySkeleton />}>
        {near ? (
          <Suspense fallback={<StorySkeleton />}>
            <Story />
          </Suspense>
        ) : (
          <StorySkeleton />
        )}
      </StoryErrorBoundary>
    </div>
  );
}
