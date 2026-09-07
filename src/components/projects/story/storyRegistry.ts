import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Project visual-world registry.
 *
 * Maps a canonical project id to a DYNAMIC loader so each project's story
 * implementation ships as its own chunk. Nothing here may import a story
 * module statically — that would pull the whole visual world into the
 * initial bundle and defeat the point of the registry.
 *
 * Future phases register one project at a time. No placeholder modules:
 * an unregistered id simply has no custom story.
 */

export interface ProjectStoryComponentProps {
  /**
   * Force the reduced composition. Omitted in every current call site — the story
   * derives compactness from the shared A2 lifecycle instead.
   */
  compact?: boolean;
}

type StoryModule = { default: ComponentType<ProjectStoryComponentProps> };
type StoryLoader = () => Promise<StoryModule>;

const STORY_LOADERS: Record<string, StoryLoader> = {
  ember: () => import('./ember/EmberStory').then(m => ({ default: m.EmberStory })),
  sociallens: () =>
    import('./sociallens/SocialLensStory').then(m => ({ default: m.SocialLensStory })),
  incidentpilot: () =>
    import('./incidentpilot/IncidentPilotStory').then(m => ({ default: m.IncidentPilotStory })),
};

/**
 * lazy() is called once at module scope, never during render — it only stores the
 * loader, so declaring it here does NOT fetch the chunk. The network request
 * happens the first time the component actually renders, which ProjectStory
 * defers until the surface approaches the viewport.
 */
export const PROJECT_STORY_COMPONENTS: Readonly<
  Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>
> = Object.assign(
  // Null prototype: an id such as "constructor" or "toString" must resolve to
  // undefined, never to an inherited Object property that React would try to render.
  Object.create(null) as Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>,
  Object.fromEntries(Object.entries(STORY_LOADERS).map(([id, load]) => [id, lazy(load)]))
);

export function hasProjectStory(projectId: string): boolean {
  return Object.prototype.hasOwnProperty.call(PROJECT_STORY_COMPONENTS, projectId);
}

/** Registered ids — used by tests and future tooling, not by render paths. */
export function registeredStoryIds(): string[] {
  return Object.keys(STORY_LOADERS);
}
