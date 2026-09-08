export type StoryDensity = 'deep' | 'medium' | 'light';

export interface StoryPresentation {
  density: StoryDensity;
  compactHeight: number;
  tabletHeight: number;
  desktopHeight: number;
}

/**
 * Presentation-only sizing for lazy story surfaces.
 *
 * These values reserve the measured rendered height at the five A16 viewport
 * widths. They intentionally do not live in canonical project content and do
 * not import any story implementation, so every visual world remains split.
 */
export const STORY_PRESENTATION = {
  ember: { density: 'deep', compactHeight: 450, tabletHeight: 592, desktopHeight: 620 },
  sociallens: { density: 'deep', compactHeight: 490, tabletHeight: 593, desktopHeight: 608 },
  incidentpilot: { density: 'deep', compactHeight: 470, tabletHeight: 572, desktopHeight: 572 },
  'clinical-reconciliation': { density: 'medium', compactHeight: 450, tabletHeight: 552, desktopHeight: 552 },
  'code-battlegrounds': { density: 'medium', compactHeight: 420, tabletHeight: 505, desktopHeight: 500 },
  timesling: { density: 'light', compactHeight: 350, tabletHeight: 410, desktopHeight: 410 },
  zenco: { density: 'light', compactHeight: 375, tabletHeight: 420, desktopHeight: 420 },
  nostalgia: { density: 'light', compactHeight: 330, tabletHeight: 400, desktopHeight: 400 },
} as const satisfies Record<string, StoryPresentation>;

export type PresentedStoryId = keyof typeof STORY_PRESENTATION;

export function getStoryPresentation(projectId: string): StoryPresentation | undefined {
  return Object.prototype.hasOwnProperty.call(STORY_PRESENTATION, projectId)
    ? STORY_PRESENTATION[projectId as PresentedStoryId]
    : undefined;
}
