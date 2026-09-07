import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeaturedProject } from '../../src/components/projects/FeaturedProject';
import { IncidentPilotStory } from '../../src/components/projects/story/incidentpilot/IncidentPilotStory';
import { ProjectStory } from '../../src/components/projects/story/ProjectStory';
import {
  PROJECT_STORY_COMPONENTS,
  hasProjectStory,
  registeredStoryIds,
  type ProjectStoryComponentProps,
} from '../../src/components/projects/story/storyRegistry';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';
import storySource from '../../src/components/projects/story/incidentpilot/IncidentPilotStory.tsx?raw';

class MockIO {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
    this.callback = cb;
    this.rootMargin = opts?.rootMargin ?? '';
  }
  observe = vi.fn((el: Element) => {
    setTimeout(
      () =>
        this.callback(
          [{ target: el, isIntersecting: true, intersectionRatio: 0.7 } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        ),
      0
    );
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

class OffscreenIO {
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(_cb: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia(reduced = false, coarse = false, width = 1440) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reduced;
    if (query.includes('pointer: coarse')) matches = coarse;
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  }) as unknown as typeof window.matchMedia;
}

function setDocumentVisible(visible: boolean) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden') as DocumentVisibilityState,
  });
}

const INCIDENTPILOT = PROJECTS.find(project => project.id === 'incidentpilot')!;

async function settle(ms = 40) {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
}

function renderStory(options: { compact?: boolean; recruiter?: boolean; reduced?: boolean } = {}) {
  mockMatchMedia(options.reduced ?? false, options.compact ?? false, options.compact ? 375 : 1440);
  window.history.replaceState({}, '', options.recruiter ? '/?mode=recruiter' : '/');
  return render(
    <PortfolioModeProvider>
      <IncidentPilotStory compact={options.compact} />
    </PortfolioModeProvider>
  );
}

function renderFeatured() {
  return render(
    <PortfolioModeProvider>
      <FeaturedProject
        project={INCIDENTPILOT}
        index={2}
        isExpanded={false}
        onToggle={() => {}}
        detailId="featured-detail-incidentpilot"
      />
    </PortfolioModeProvider>
  );
}

function stageOf(container: HTMLElement) {
  return container.querySelector('[role="img"][aria-label*="Incident evidence from CI logs"]');
}

beforeEach(() => {
  __resetStoryLifecycleForTests();
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
  mockMatchMedia();
  setDocumentVisible(true);
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  __resetStoryLifecycleForTests();
  setDocumentVisible(true);
});

describe('A10 — IncidentPilot lazy registry', () => {
  it('registers IncidentPilot lazily while preserving Ember and SocialLens', () => {
    expect(registeredStoryIds()).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(hasProjectStory('ember')).toBe(true);
    expect(hasProjectStory('sociallens')).toBe(true);
    expect(hasProjectStory('incidentpilot')).toBe(true);
    expect(registrySource).toMatch(
      /\(\)\s*=>\s*\n?\s*import\('\.\/incidentpilot\/IncidentPilotStory'\)/
    );
    expect(registrySource).not.toMatch(/^import\s+.*IncidentPilotStory/m);
    const component = PROJECT_STORY_COMPONENTS.incidentpilot as unknown as { $$typeof: symbol };
    expect(String(component.$$typeof)).toContain('lazy');
  });

  it('does not leak the story module into initial-bundle render paths', () => {
    expect(registrySource).toContain("import('./ember/EmberStory')");
    expect(registrySource).toContain("import('./sociallens/SocialLensStory')");
    expect(storySource).not.toMatch(/new IntersectionObserver/);
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
  });
});

describe('A10 — evidence-grounded visual semantics', () => {
  it('renders exactly one aggregate image and no interactive or live controls', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = stageOf(container)!;
    expect(stage).not.toBeNull();
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('starts with compact failure evidence and repository context', () => {
    const { container } = renderStory({ recruiter: true });
    const text = stageOf(container)!.textContent!;
    expect(text).toContain('Failure evidence');
    expect(text).toContain('CI log');
    expect(text).toContain('failure output');
    expect(text).toContain('Stack trace');
    expect(text).toContain('cited location');
    expect(text).toContain('repository snapshot context');
  });

  it('makes grounding and citation verification the centre of gravity', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const grounding = stage.querySelector('[data-node-id="grounding"]')!;
    expect(grounding.textContent).toContain('grounding workspace · citation verification');
    expect(grounding.textContent).toContain('cited fileexists ✓');
    expect(grounding.textContent).toContain('cited lineverified ✓');
    expect(grounding.textContent).toContain('repository evidencegrounded ✓');
    expect(grounding.textContent).toContain('Scoped reasoninggrounded evidence only');
  });

  it('represents safe redaction without rendering a credential-like value', () => {
    const { container } = renderStory({ recruiter: true });
    const text = stageOf(container)!.textContent!;
    expect(text).toContain('sensitive value');
    expect(text).toContain('[REDACTED]');
    expect(text).not.toMatch(/Bearer\s|eyJ[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]+|AIza[A-Za-z0-9_-]+/);
  });

  it('separates deterministic controls from secondary semantic reasoning', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const safety = stage.querySelector('[data-node-id="safety"]')!;
    expect(safety.textContent).toContain('Deterministic safety gate');
    expect(safety.textContent).toContain('evidence grounded');
    expect(safety.textContent).toContain('path allowed');
    expect(safety.textContent).toContain('output valid');
    expect(stage.querySelector('[data-story-node="primary"][data-node-id="reasoning"]')).toBeNull();
    expect(stage.textContent).toContain('Scoped reasoning');
  });

  it('places passive human approval before the dry-run endpoint', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const ids = [...stage.querySelectorAll('[data-story-node="primary"]')].map(node =>
      node.getAttribute('data-node-id')
    );
    expect(ids).toEqual(['evidence', 'bundle', 'grounding', 'safety', 'approval', 'dry-run']);
    expect(ids.indexOf('approval')).toBeLessThan(ids.indexOf('dry-run'));
    expect(stage.querySelector('[data-node-id="approval"]')!.textContent).toContain('APPROVED');
    expect(stage.querySelector('[data-node-id="dry-run"]')!.textContent).toContain('GitHub dry-run');
    expect(stage.querySelector('[data-node-id="dry-run"]')!.textContent).toContain(
      'no repository mutation'
    );
  });

  it('avoids automatic remediation, deployment, and fabricated incident claims', () => {
    const { container } = renderStory({ recruiter: true });
    const rendered = `${stageOf(container)!.getAttribute('aria-label')} ${stageOf(container)!.textContent}`;
    expect(rendered).not.toMatch(
      /autonomous remediation|self-healing|automatic production fix|deploy fix|production deployment|auto-merge|auto-commit|incident resolved automatically|zero-touch remediation/i
    );
    expect(rendered).not.toMatch(/438|8\s*\/\s*8|Kaggle|Gemini|service\.py|line\s+\d+/i);
    expect(rendered).not.toMatch(/ember|orchestrator|YouTube|snapshot history|daily snapshots/i);
  });
});

describe('A10 — responsive composition and lifecycle', () => {
  it('uses six desktop objects and four compact objects', () => {
    const desktop = renderStory({ recruiter: true });
    expect(stageOf(desktop.container)!.querySelectorAll('[data-story-node="primary"]')).toHaveLength(6);
    desktop.unmount();
    __resetStoryLifecycleForTests();

    const compact = renderStory({ compact: true, recruiter: true });
    const nodes = stageOf(compact.container)!.querySelectorAll('[data-story-node="primary"]');
    expect(nodes).toHaveLength(4);
    expect([...nodes].map(node => node.getAttribute('data-node-id'))).toEqual([
      'evidence',
      'grounded-investigation',
      'safety-approval',
      'dry-run',
    ]);
    expect(compact.container.textContent).toContain('repository context');
    expect(compact.container.textContent).toContain('[REDACTED]');
  });

  it('renders the complete final state for recruiter and reduced-motion modes', () => {
    const recruiter = renderStory({ recruiter: true });
    expect(recruiter.container.textContent).toContain('Static system');
    expect(recruiter.container.textContent).toContain('APPROVED');
    expect(recruiter.container.textContent).toContain('DRY-RUN READY');
    recruiter.unmount();
    __resetStoryLifecycleForTests();

    const reduced = renderStory({ reduced: true });
    expect(reduced.container.textContent).toContain('Static system');
    expect(reduced.container.textContent).toContain('grounded ✓');
    expect(reduced.container.textContent).toContain('DRY-RUN READY');
  });

  it('creates no animation timers while offscreen', async () => {
    vi.useFakeTimers();
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(container.textContent).toContain('Paused offscreen');
    expect(container.textContent).toContain('HELD');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pauses while the document is hidden', async () => {
    vi.useFakeTimers();
    setDocumentVisible(false);
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(container.textContent).toContain('Paused offscreen');
    expect(container.textContent).toContain('HELD');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('holds the visible WAITING approval state before approval', async () => {
    vi.useFakeTimers();
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    for (const delay of [650, 650, 850, 650, 650]) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(delay);
      });
    }
    expect(container.textContent).toContain('WAITING');
    expect(container.textContent).toContain('Waiting for approval');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(container.textContent).toContain('WAITING');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(container.textContent).toContain('APPROVED');
  });
});

describe('A10 — canonical data and failure isolation', () => {
  it('requires no data or schema mutation', () => {
    expect(INCIDENTPILOT).toMatchObject({
      id: 'incidentpilot',
      title: 'IncidentPilot',
      subtitle: 'Approval-Gated Incident Investigator',
      contribution: 'solo',
      featured: true,
      featuredOrder: 3,
      links: { github: 'https://github.com/AruruGunabhiram/IncidentPilot' },
    });
    expect(INCIDENTPILOT.demo).toBeUndefined();
    expect(PROJECTS).toHaveLength(8);
    expect(JSON.stringify(INCIDENTPILOT)).not.toMatch(/"story"|"animation"|"sequence"/);
  });

  it('keeps all project content usable when the story chunk rejects', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<
      string,
      LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>
    >;
    const original = registry.incidentpilot;
    registry.incidentpilot = lazy(async () => {
      throw new Error('simulated IncidentPilot chunk failure');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = renderFeatured();
      await settle(80);
      const text = container.textContent!;
      expect(text).toContain('IncidentPilot');
      expect(text).toContain('Approval-Gated Incident Investigator');
      expect(text).toContain('approval-gated incident investigation assistant');
      expect(text).toContain('Sequential investigation workflow');
      expect(text).toContain('Python · FastAPI · Pydantic · Gemini API · Pytest');
      expect(container.querySelector('a[href="https://github.com/AruruGunabhiram/IncidentPilot"]')).not.toBeNull();
      expect(container.querySelector('button[aria-controls="featured-detail-incidentpilot"]')).not.toBeNull();
      expect(stageOf(container)).toBeNull();
      expect(container.querySelector('[aria-hidden="true"][class*="min-h-"]')).not.toBeNull();
    } finally {
      registry.incidentpilot = original;
      error.mockRestore();
      warning.mockRestore();
    }
  });

  it('keeps unregistered ProjectStory fallback behavior intact', () => {
    const { container } = render(
      <PortfolioModeProvider>
        <ProjectStory projectId="zenco" fallback={<p>safe fallback</p>} />
      </PortfolioModeProvider>
    );
    expect(container.textContent).toBe('safe fallback');
  });
});
