import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClinicalReconciliationStory } from '../../src/components/projects/story/clinical/ClinicalReconciliationStory';
import { ProjectListItem } from '../../src/components/projects/ProjectListItem';
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
import storySource from '../../src/components/projects/story/clinical/ClinicalReconciliationStory.tsx?raw';

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

const CLINICAL = PROJECTS.find(project => project.id === 'clinical-reconciliation')!;

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
      <ClinicalReconciliationStory compact={options.compact} />
    </PortfolioModeProvider>
  );
}

function renderExplorerItem() {
  return render(
    <PortfolioModeProvider>
      <ProjectListItem
        project={CLINICAL}
        isExpanded={false}
        onToggle={() => {}}
        detailId="explorer-detail-clinical-reconciliation"
      />
    </PortfolioModeProvider>
  );
}

function stageOf(container: HTMLElement) {
  return container.querySelector('[role="img"][aria-label*="Multiple synthetic medication-source records"]');
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

describe('A11 — Clinical Reconciliation lazy registry', () => {
  it('registers only Clinical in A11 while preserving every existing story and unknown-id safety', () => {
    expect(registeredStoryIds()).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
      'clinical-reconciliation',
    ]);
    for (const id of registeredStoryIds()) expect(hasProjectStory(id)).toBe(true);
    expect(hasProjectStory('code-battlegrounds')).toBe(false);
    expect(hasProjectStory('constructor')).toBe(false);
    expect(registrySource).toMatch(
      /'clinical-reconciliation':\s*\(\)\s*=>\s*\n?\s*import\('\.\/clinical\/ClinicalReconciliationStory'\)/
    );
    expect(registrySource).not.toMatch(/^import\s+.*ClinicalReconciliationStory/m);
    const component = PROJECT_STORY_COMPONENTS['clinical-reconciliation'] as unknown as {
      $$typeof: symbol;
    };
    expect(String(component.$$typeof)).toContain('lazy');
  });

  it('reuses the competitive lifecycle without adding an observer or preload path', () => {
    expect(storySource).not.toMatch(/new IntersectionObserver|useReducedMotion|usePortfolioMode/);
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
    expect(registrySource).toContain("import('./ember/EmberStory')");
    expect(registrySource).toContain("import('./sociallens/SocialLensStory')");
    expect(registrySource).toContain("import('./incidentpilot/IncidentPilotStory')");
  });
});

describe('A11 — comparison, uncertainty, and review semantics', () => {
  it('renders exactly one aggregate image with no controls or live regions', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    expect(stage).not.toBeNull();
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('makes multiple synthetic source records and normalization explicit', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const sources = stage.querySelector('[data-node-id="sources"]')!;
    expect(sources.textContent).toContain('Medication-source records');
    expect(sources.textContent).toContain('synthetic example');
    expect(sources.textContent).toContain('Source A');
    expect(sources.textContent).toContain('Source B');
    expect(sources.textContent).toContain('Source C');
    expect(sources.textContent).toContain('Record 1');
    expect(stage.querySelector('[data-node-id="normalized"]')!.textContent).toContain('Normalized record');
    expect(stage.textContent).toContain('COMPARABLE');
  });

  it('centres a comparison matrix with one neutral conflict and one missing field', () => {
    const { container } = renderStory({ recruiter: true });
    const comparison = stageOf(container)!.querySelector('[data-node-id="comparison"]')!;
    expect(comparison.textContent).toContain('medication comparison · discrepancy workspace');
    expect(comparison.textContent).toContain('Medication A');
    expect(comparison.textContent).toContain('10 mg · 20 mg · 10 mg');
    expect(comparison.textContent).toContain('value conflict');
    expect(comparison.textContent).toContain('Frequency');
    expect(comparison.textContent).toContain('missing field');
    expect(comparison.textContent).not.toMatch(/dangerous|unsafe|wrong prescription|emergency/i);
  });

  it('represents all quality dimensions, non-numeric confidence, and restrained severity', () => {
    const { container } = renderStory({ recruiter: true });
    const assessment = stageOf(container)!.querySelector('[data-node-id="assessment"]')!;
    expect(assessment.textContent).toContain('Completeness');
    expect(assessment.textContent).toContain('Accuracy');
    expect(assessment.textContent).toContain('Timeliness');
    expect(assessment.textContent).toContain('Plausibility');
    expect(assessment.textContent).toContain('Confidence');
    expect(assessment.textContent).toContain('low');
    expect(assessment.textContent).toContain('high');
    expect(assessment.textContent).toContain('Severity · review required');
    expect(assessment.textContent).not.toMatch(/0\.\d+|critical|life threatening|emergency/i);
  });

  it('places passive approve/reject review before an accepted reconciliation result', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const ids = [...stage.querySelectorAll('[data-story-node="primary"]')].map(node =>
      node.getAttribute('data-node-id')
    );
    expect(ids).toEqual(['sources', 'normalized', 'comparison', 'assessment', 'review', 'result']);
    expect(ids.indexOf('review')).toBeLessThan(ids.indexOf('result'));
    expect(stage.querySelector('[data-node-id="review"]')!.textContent).toContain('APPROVED');
    expect(stage.querySelector('[data-node-id="review"]')!.textContent).toContain('approve / reject required');
    expect(stage.querySelector('[data-node-id="result"]')!.textContent).toContain('ACCEPTED');
    expect(stage.querySelector('[data-node-id="result"]')!.textContent).toContain('accepted after review');
  });

  it('stays inside the absolute medical-claim boundary', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const rendered = `${stage.getAttribute('aria-label')} ${stage.textContent}`;
    expect(rendered).not.toMatch(
      /diagnos|treatment|prescri|medication (changed|change|ordered)|patient outcome|clinically validated|hospital|HIPAA|FDA|clinical accuracy|real patient|clinician replacement|medical decision|safe medication/i
    );
    expect(rendered).not.toMatch(/Claude|Anthropic|AI doctor|LLM clinician|\bEpic\b|Cerner|FHIR/i);
  });
});

describe('A11 — responsive composition and lifecycle', () => {
  it('uses six desktop concepts and four compact concepts', () => {
    const desktop = renderStory({ recruiter: true });
    expect(stageOf(desktop.container)!.querySelectorAll('[data-story-node="primary"]')).toHaveLength(6);
    desktop.unmount();
    __resetStoryLifecycleForTests();

    const compact = renderStory({ compact: true, recruiter: true });
    const nodes = stageOf(compact.container)!.querySelectorAll('[data-story-node="primary"]');
    expect(nodes).toHaveLength(4);
    expect([...nodes].map(node => node.getAttribute('data-node-id'))).toEqual([
      'sources',
      'comparison',
      'quality-review',
      'result',
    ]);
    expect(compact.container.textContent).toContain('NORMALIZED');
    expect(compact.container.textContent).toContain('Human review');
  });

  it('renders the full final story in recruiter and reduced-motion modes', () => {
    const recruiter = renderStory({ recruiter: true });
    expect(recruiter.container.textContent).toContain('Static system');
    expect(recruiter.container.textContent).toContain('value conflict');
    expect(recruiter.container.textContent).toContain('APPROVED');
    expect(recruiter.container.textContent).toContain('ACCEPTED');
    recruiter.unmount();
    __resetStoryLifecycleForTests();

    const reduced = renderStory({ reduced: true });
    expect(reduced.container.textContent).toContain('Static system');
    expect(reduced.container.textContent).toContain('missing field');
    expect(reduced.container.textContent).toContain('APPROVED');
    expect(reduced.container.textContent).toContain('ACCEPTED');
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

  it('pauses with no story timer while the document is hidden', async () => {
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

  it('holds pending review before approval, then accepts only after approval', async () => {
    vi.useFakeTimers();
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    for (const delay of [650, 650, 850, 650]) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(delay);
      });
    }
    expect(container.textContent).toContain('PENDING');
    expect(container.textContent).toContain('HELD');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(container.textContent).toContain('PENDING');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(container.textContent).toContain('APPROVED');
    expect(container.textContent).toContain('HELD');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(650);
    });
    expect(container.textContent).toContain('ACCEPTED');
  });
});

describe('A11 — canonical data, real-page host, and failure isolation', () => {
  it('requires no data mutation and keeps the featured set unchanged', () => {
    expect(CLINICAL).toMatchObject({
      id: 'clinical-reconciliation',
      title: 'Clinical Reconciliation',
      subtitle: 'Medication Review Platform',
      contribution: 'solo',
      featured: false,
      links: {
        github: 'https://github.com/AruruGunabhiram/clinical-reconciliation',
        live: 'https://clinical-reconciliation.vercel.app',
      },
    });
    expect(CLINICAL.demo).toBeUndefined();
    expect(CLINICAL.technologies).not.toContain('Claude');
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
    ]);
    expect(JSON.stringify(CLINICAL)).not.toMatch(/"story"|"animation"|"sequence"/);
  });

  it('hosts the non-featured story in the explorer and preserves item content on failure', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<
      string,
      LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>
    >;
    const original = registry['clinical-reconciliation'];
    registry['clinical-reconciliation'] = lazy(async () => {
      throw new Error('simulated Clinical chunk failure');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = renderExplorerItem();
      await settle(80);
      expect(container.textContent).toContain('Clinical Reconciliation');
      expect(container.textContent).toContain('Medication Review Platform');
      expect(container.textContent).toContain('Python · FastAPI · React · +3');
      expect(container.querySelector('button[aria-controls="explorer-detail-clinical-reconciliation"]')).not.toBeNull();
      expect(container.querySelector('a[href="https://github.com/AruruGunabhiram/clinical-reconciliation"]')).not.toBeNull();
      expect(container.querySelector('a[href="https://clinical-reconciliation.vercel.app"]')).not.toBeNull();
      expect(stageOf(container)).toBeNull();
    } finally {
      registry['clinical-reconciliation'] = original;
      error.mockRestore();
      warning.mockRestore();
    }
  });

  it('keeps unknown ProjectStory fallback behavior intact', () => {
    const { container } = render(
      <PortfolioModeProvider>
        <ProjectStory projectId="zenco" fallback={<p>safe fallback</p>} />
      </PortfolioModeProvider>
    );
    expect(container.textContent).toBe('safe fallback');
  });
});
