import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBattlegroundsStory } from '../../src/components/projects/story/code-battlegrounds/CodeBattlegroundsStory';
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
import storySource from '../../src/components/projects/story/code-battlegrounds/CodeBattlegroundsStory.tsx?raw';

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
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : query.includes('pointer: coarse') ? coarse : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setDocumentVisible(visible: boolean) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden') as DocumentVisibilityState,
  });
}

const CODE_BATTLEGROUNDS = PROJECTS.find(project => project.id === 'code-battlegrounds')!;

function renderStory(options: { compact?: boolean; recruiter?: boolean; reduced?: boolean } = {}) {
  mockMatchMedia(options.reduced ?? false, options.compact ?? false, options.compact ? 375 : 1440);
  window.history.replaceState({}, '', options.recruiter ? '/?mode=recruiter' : '/');
  return render(
    <PortfolioModeProvider>
      <CodeBattlegroundsStory compact={options.compact} />
    </PortfolioModeProvider>
  );
}

function renderExplorerItem() {
  return render(
    <PortfolioModeProvider>
      <ProjectListItem
        project={CODE_BATTLEGROUNDS}
        isExpanded={false}
        onToggle={() => {}}
        detailId="explorer-detail-code-battlegrounds"
      />
    </PortfolioModeProvider>
  );
}

function stageOf(container: HTMLElement) {
  return container.querySelector('[role="img"][aria-label*="collaborative coding session"]');
}

async function settle(ms = 50) {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
  });
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

describe('A12 — lazy registry and lifecycle', () => {
  it('registers Code Battlegrounds lazily while preserving all four earlier stories and unknown-id safety', () => {
    expect(registeredStoryIds()).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
      'clinical-reconciliation',
      'code-battlegrounds',
    ]);
    for (const id of registeredStoryIds()) expect(hasProjectStory(id)).toBe(true);
    for (const id of ['timesling', 'zenco', 'nostalgia', 'constructor', '__proto__']) {
      expect(hasProjectStory(id), id).toBe(false);
      expect(PROJECT_STORY_COMPONENTS[id], id).toBeUndefined();
    }
    expect(registrySource).toMatch(
      /'code-battlegrounds':\s*\(\)\s*=>\s*\n?\s*import\('\.\/code-battlegrounds\/CodeBattlegroundsStory'\)/
    );
    expect(registrySource).not.toMatch(/^import\s+.*CodeBattlegroundsStory/m);
    const component = PROJECT_STORY_COMPONENTS['code-battlegrounds'] as unknown as { $$typeof: symbol };
    expect(String(component.$$typeof)).toContain('lazy');
  });

  it('reuses the competitive shared lifecycle with no local observer or alternate mode hooks', () => {
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
    expect(storySource).not.toMatch(/new IntersectionObserver|useReducedMotion|usePortfolioMode/);
    expect(registrySource).not.toMatch(/preload|timesling\/|zenco\/|nostalgia\//i);
  });
});

describe('A12 — canonical facts and truthful visual semantics', () => {
  it('preserves the canonical eight-project inventory, featured set, links, technologies, and co-built attribution', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
    ]);
    expect(CODE_BATTLEGROUNDS).toMatchObject({
      id: 'code-battlegrounds',
      title: 'Code Battlegrounds',
      featured: false,
      contribution: 'co-built',
      links: {
        github: 'https://github.com/Kanyarasi2026/code-battle-grounds',
        live: 'https://code-battle-grounds.vercel.app',
      },
    });
    expect(CODE_BATTLEGROUNDS.technologies).toEqual(expect.arrayContaining([
      'React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'Socket.IO', 'Supabase',
      'PostgreSQL', 'Judge0', 'Gemini API', 'ElevenLabs', 'SCSS',
    ]));
    expect(CODE_BATTLEGROUNDS.demo?.type).toBe('flow');
  });

  it('renders one aggregate visual, no controls/live regions, and five ordered desktop concepts', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    expect(stage).not.toBeNull();
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect([...stage.querySelectorAll('[data-story-node="primary"]')].map(node => node.getAttribute('data-node-id'))).toEqual([
      'challenge', 'shared-session', 'submission', 'execution', 'result',
    ]);
  });

  it('centres challenge, shared editor/session, Socket.IO synchronization, queued submission, Judge0, and test feedback', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    expect(stage.textContent).toContain('Coding challenge');
    expect(stage.textContent).toContain('Implement function solve(input)');
    const session = stage.querySelector('[data-node-id="shared-session"]')!;
    expect(session.textContent).toContain('Shared editor');
    expect(session.textContent).toContain('participant A · participant B');
    expect(session.textContent).toContain('2 CONNECTED · SYNCED');
    expect(session.textContent).toContain('Realtime sync');
    expect(session.textContent).toContain('Socket.IO · one shared room state');
    expect(stage.querySelector('[data-node-id="submission"]')!.textContent).toContain('submission queued');
    expect(stage.querySelector('[data-node-id="execution"]')!.textContent).toContain('Judge0 execution · complete');
    expect(stage.querySelector('[data-node-id="execution"]')!.textContent).toContain('integrated execution service');
    expect(stage.querySelector('[data-node-id="result"]')!.textContent).toContain('test 1 · PASS');
    expect(stage.querySelector('[data-node-id="result"]')!.textContent).toContain('feedback synchronized to shared session');
  });

  it('orders submission before execution and results while avoiding unsupported claims and gaming semantics', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    const ids = [...stage.querySelectorAll('[data-story-node="primary"]')].map(node => node.getAttribute('data-node-id'));
    expect(ids.indexOf('submission')).toBeLessThan(ids.indexOf('execution'));
    expect(ids.indexOf('execution')).toBeLessThan(ids.indexOf('result'));
    const rendered = `${stage.getAttribute('aria-label')} ${stage.textContent}`;
    expect(rendered).not.toMatch(/\b\d+\s*(ms|milliseconds?|mb|gb)\b|runtime score|memory usage/i);
    expect(rendered).not.toMatch(/generate(?:s|d)? (?:the |your )?(?:code|solution)|autonomous|copilot|assistant/i);
    expect(rendered).not.toMatch(/leaderboard|health bar|\bXP\b|versus|victory|avatar|score explosion|fire effect|battle mode/i);
    expect(rendered).not.toMatch(/Gemini|ElevenLabs|AI hint|voice assist|OAuth|Supabase|PostgreSQL/i);
  });

  it('uses four compact concepts with realtime nested into the shared session', () => {
    const { container } = renderStory({ compact: true, recruiter: true });
    const stage = stageOf(container)!;
    expect([...stage.querySelectorAll('[data-story-node="primary"]')].map(node => node.getAttribute('data-node-id'))).toEqual([
      'challenge', 'shared-session', 'submit-execute', 'result',
    ]);
    expect(stage.querySelector('[data-node-id="shared-session"]')!.textContent).toContain('2 CONNECTED · SYNCED');
    expect(stage.querySelector('[data-node-id="submit-execute"]')!.textContent).toContain('submission queued → Judge0 execution');
  });
});

describe('A12 — static and paused lifecycle behavior', () => {
  it('renders the complete final story immediately in recruiter and reduced-motion modes', () => {
    const recruiter = renderStory({ recruiter: true });
    expect(stageOf(recruiter.container)!.querySelector('[data-phase="6"]')).not.toBeNull();
    expect(recruiter.container.textContent).toContain('Static system');
    expect(recruiter.container.textContent).toContain('EXECUTION COMPLETE');
    recruiter.unmount();
    __resetStoryLifecycleForTests();

    const reduced = renderStory({ reduced: true });
    expect(stageOf(reduced.container)!.querySelector('[data-phase="6"]')).not.toBeNull();
    expect(reduced.container.textContent).toContain('Static system');
    expect(reduced.container.textContent).toContain('feedback synchronized to shared session');
  });

  it('creates no animation timer while offscreen', async () => {
    vi.useFakeTimers();
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(container.querySelector('[data-phase="0"]')).not.toBeNull();
    expect(container.textContent).toContain('Paused offscreen');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('pauses with no animation timer while the document is hidden', async () => {
    vi.useFakeTimers();
    setDocumentVisible(false);
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(container.querySelector('[data-phase="0"]')).not.toBeNull();
    expect(container.textContent).toContain('Paused offscreen');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('advances once through sync, queue, execution, and results in that order', async () => {
    vi.useFakeTimers();
    const { container } = renderStory();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    for (const [delay, phase] of [[550, 1], [700, 2], [800, 3], [600, 4], [700, 5], [700, 6]] as const) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(delay);
      });
      expect(container.querySelector(`[data-phase="${phase}"]`)).not.toBeNull();
    }
    expect(container.textContent).toContain('submission queued');
    expect(container.textContent).toContain('Judge0 execution · complete');
    expect(container.textContent).toContain('EXECUTION COMPLETE');
  });
});

describe('A12 — explorer host and chunk-failure fallback', () => {
  it('uses the existing demo fallback and preserves card content and public links if the lazy story fails', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>;
    const original = registry['code-battlegrounds'];
    registry['code-battlegrounds'] = lazy(async () => {
      throw new Error('simulated Code Battlegrounds chunk failure');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = renderExplorerItem();
      await settle(100);
      expect(stageOf(container)).toBeNull();
      expect(container.textContent).toContain('Code Battlegrounds');
      expect(container.textContent).toContain('Full-Stack Collaborative Coding Platform');
      expect(container.textContent).toContain('React · TypeScript · Vite · +9');
      expect(container.querySelector('button[aria-controls="explorer-detail-code-battlegrounds"]')).not.toBeNull();
      expect(container.querySelector('a[href="https://github.com/Kanyarasi2026/code-battle-grounds"]')).not.toBeNull();
      expect(container.querySelector('a[href="https://code-battle-grounds.vercel.app"]')).not.toBeNull();
      expect(container.querySelector('[role="img"][aria-label*="Code Battlegrounds flow"]')).not.toBeNull();
    } finally {
      registry['code-battlegrounds'] = original;
      error.mockRestore();
      warning.mockRestore();
    }
  });

  it('keeps unknown ProjectStory fallback behavior intact', () => {
    const { container } = render(
      <PortfolioModeProvider>
        <ProjectStory projectId="timesling" fallback={<p>safe fallback</p>} />
      </PortfolioModeProvider>
    );
    expect(container.textContent).toBe('safe fallback');
  });
});
