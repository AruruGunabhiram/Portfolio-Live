import { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectListItem } from '../../src/components/projects/ProjectListItem';
import { FlowDemo } from '../../src/components/projects/demo/FlowDemo';
import { STORY_PRESENTATION } from '../../src/components/projects/story/storyPresentation';
import {
  PROJECT_STORY_COMPONENTS,
  registeredStoryIds,
} from '../../src/components/projects/story/storyRegistry';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { PROJECTS } from '../../src/data/projects';
import {
  __resetStoryLifecycleForTests,
  useCompetitiveStoryActive,
} from '../../src/hooks/useStoryLifecycle';
import { Projects } from '../../src/sections/Projects';
import projectDataSource from '../../src/data/projects.ts?raw';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';
import experienceProjectsBridgeSource from '../../src/components/transitions/ExperienceProjectsBridge.tsx?raw';

const IDS = [
  'ember',
  'sociallens',
  'incidentpilot',
  'clinical-reconciliation',
  'code-battlegrounds',
  'timesling',
  'zenco',
  'nostalgia',
] as const;

class OffscreenIO {
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

class CompetitionIO {
  static callback: IntersectionObserverCallback | null = null;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(callback: IntersectionObserverCallback) {
    CompetitionIO.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia(reduced = false) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function CompetitiveProbe({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useCompetitiveStoryActive(ref);
  return <div ref={ref} data-testid={id} data-active={String(active)} />;
}

beforeEach(() => {
  __resetStoryLifecycleForTests();
  mockMatchMedia();
  window.scrollTo = vi.fn();
  window.history.replaceState({}, '', '/');
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
});

afterEach(() => {
  vi.clearAllMocks();
  __resetStoryLifecycleForTests();
  CompetitionIO.callback = null;
});

describe('A16 — canonical boundaries and presentation registry', () => {
  it('keeps the eight-project inventory and featured order frozen', () => {
    expect(PROJECTS.map(project => project.id)).toEqual(IDS);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
    ]);
  });

  it('keeps all eight story modules dynamic and presentation metadata complete', () => {
    expect(registeredStoryIds()).toEqual(IDS);
    expect(Object.keys(STORY_PRESENTATION)).toEqual(IDS);
    expect((registrySource.match(/=>\s*import\('/g) ?? [])).toHaveLength(8);
    expect(registrySource).not.toMatch(/^import\s+.*Story['"]/m);
    for (const id of IDS) {
      expect(String((PROJECT_STORY_COMPONENTS[id] as unknown as { $$typeof: symbol }).$$typeof)).toContain('lazy');
      const presentation = STORY_PRESENTATION[id];
      expect(['deep', 'medium', 'light']).toContain(presentation.density);
      for (const height of [presentation.compactHeight, presentation.tabletHeight, presentation.desktopHeight]) {
        expect(Number.isInteger(height), `${id} integer reservation`).toBe(true);
        expect(height, `${id} minimum reservation`).toBeGreaterThanOrEqual(330);
        expect(height, `${id} maximum reservation`).toBeLessThanOrEqual(620);
      }
    }
  });

  it('keeps presentation metadata out of canonical project content and A6 intact', () => {
    expect(projectDataSource).not.toMatch(/compactHeight|tabletHeight|desktopHeight|StoryPresentation|density/);
    expect(experienceProjectsBridgeSource).toMatch(/useExperienceProjectsProgress/);
  });
});

describe('A16 — attribution and explorer density', () => {
  it('renders quiet attribution only for the three co-built projects', () => {
    const { container } = render(
      <PortfolioModeProvider>
        {PROJECTS.map(project => (
          <ProjectListItem key={project.id} project={project} isExpanded={false} onToggle={() => {}} />
        ))}
      </PortfolioModeProvider>
    );

    expect(screen.getAllByText('Co-built')).toHaveLength(3);
    expect(container.textContent).not.toMatch(/\bSolo\b|commit percentage|\d+%/i);
    expect(PROJECTS.filter(project => project.contribution === 'co-built').map(project => project.id)).toEqual([
      'code-battlegrounds',
      'zenco',
      'nostalgia',
    ]);
  });

  it('opens as a compact index and mounts only the selected secondary story', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PortfolioModeProvider>
        <Projects />
      </PortfolioModeProvider>
    );

    expect(container.querySelectorAll('[data-project-story]')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: /Explore all projects/i }));
    expect(container.querySelectorAll('[data-project-story]')).toHaveLength(3);
    expect(container.querySelectorAll('#project-explorer article')).toHaveLength(8);

    await user.click(container.querySelector('button[aria-controls="explorer-detail-timesling"]')!);
    expect(container.querySelectorAll('[data-project-story]')).toHaveLength(4);
    expect(container.querySelector('[data-project-story="timesling"]')).not.toBeNull();
    expect(container.querySelector('[data-project-story="zenco"]')).toBeNull();
  });
});

describe('A16 — global competitive lifecycle proof', () => {
  it('allows one winner across featured, explorer and FlowDemo fallback, then hands off after unmount', () => {
    __resetStoryLifecycleForTests();
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = CompetitionIO;

    const view = (showFallback: boolean) => (
      <PortfolioModeProvider>
        <CompetitiveProbe id="featured-story" />
        <CompetitiveProbe id="explorer-story" />
        {showFallback && (
          <FlowDemo
            demo={{
              type: 'flow',
              ariaLabel: 'Fallback flow',
              durationMs: 4000,
              steps: [
                { id: 'one', label: 'One' },
                { id: 'two', label: 'Two' },
              ],
            }}
          />
        )}
      </PortfolioModeProvider>
    );

    const { rerender } = render(view(true));
    const featured = screen.getByTestId('featured-story');
    const explorer = screen.getByTestId('explorer-story');
    const fallback = screen.getByRole('img', { name: 'Fallback flow' });
    const callback = CompetitionIO.callback!;

    act(() => {
      callback(
        [
          { target: featured, isIntersecting: true, intersectionRatio: 0.7 },
          { target: explorer, isIntersecting: true, intersectionRatio: 0.6 },
          { target: fallback, isIntersecting: true, intersectionRatio: 0.9 },
        ] as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(featured).toHaveAttribute('data-active', 'false');
    expect(explorer).toHaveAttribute('data-active', 'false');
    expect(fallback).toHaveTextContent('Looping · pauses offscreen');

    rerender(view(false));
    expect(screen.getByTestId('featured-story')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('explorer-story')).toHaveAttribute('data-active', 'false');
  });
});
