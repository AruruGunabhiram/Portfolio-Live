import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { FeaturedProject } from '../../src/components/projects/FeaturedProject';
import { ProjectStory } from '../../src/components/projects/story/ProjectStory';
import {
  hasProjectStory,
  registeredStoryIds,
  PROJECT_STORY_COMPONENTS,
} from '../../src/components/projects/story/storyRegistry';
import { SocialLensStory } from '../../src/components/projects/story/sociallens/SocialLensStory';
import { EmberStory } from '../../src/components/projects/story/ember/EmberStory';
import { FlowDemo } from '../../src/components/projects/demo/FlowDemo';
import { PROJECTS } from '../../src/data/projects';
import type { FlowDemo as FlowDemoType } from '../../src/types/portfolio';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';

const STORY_SOURCE = readFileSync(
  'src/components/projects/story/sociallens/SocialLensStory.tsx',
  'utf8'
);

// ─── Environment doubles ────────────────────────────────────────────────────
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
          [
            {
              target: el,
              isIntersecting: true,
              intersectionRatio: 0.6,
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver
        ),
      0
    );
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

/** Never reports intersection — models a surface far from the viewport. */
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

/** Records every observed element so a test can drive explicit ratios. */
class CompetitiveIO {
  static instances: CompetitiveIO[] = [];
  callback: IntersectionObserverCallback;
  targets: Element[] = [];
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    CompetitiveIO.instances.push(this);
  }
  observe = (el: Element) => {
    this.targets.push(el);
  };
  unobserve = (el: Element) => {
    this.targets = this.targets.filter(t => t !== el);
  };
  disconnect = () => {
    this.targets = [];
  };
  takeRecords = () => [] as IntersectionObserverEntry[];
  fire(ratioFor: (el: Element) => number) {
    this.callback(
      this.targets.map(
        t =>
          ({
            target: t,
            isIntersecting: ratioFor(t) > 0,
            intersectionRatio: ratioFor(t),
          }) as IntersectionObserverEntry
      ),
      this as unknown as IntersectionObserver
    );
  }
}

function mockMatchMedia(reduced = false, coarse = false, width = 1440) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
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

function setDocVisible(v: boolean) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (v ? 'visible' : 'hidden') as DocumentVisibilityState,
  });
}

const SOCIALLENS = PROJECTS.find(p => p.id === 'sociallens')!;
const EMBER = PROJECTS.find(p => p.id === 'ember')!;

async function settle(ms = 30) {
  await act(async () => {
    await new Promise(r => setTimeout(r, ms));
  });
}

function renderFeatured(project = SOCIALLENS, recruiter = false) {
  window.history.replaceState({}, '', `/${recruiter ? '?mode=recruiter' : ''}`);
  return render(
    <PortfolioModeProvider>
      <FeaturedProject project={project} index={1} isExpanded={false} onToggle={() => {}} />
    </PortfolioModeProvider>
  );
}

/** The SocialLens story stage, distinguished from the FlowDemo stage by its label. */
function stageOf(container: HTMLElement) {
  return container.querySelector('[role="img"][aria-label*="idempotent daily snapshots"]');
}

beforeEach(() => {
  CompetitiveIO.instances = [];
  __resetStoryLifecycleForTests();
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
  mockMatchMedia(false, false, 1440);
  setDocVisible(true);
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.clearAllMocks();
  __resetStoryLifecycleForTests();
});

// ─── 1–3 · Registry ─────────────────────────────────────────────────────────
describe('A9 — registry', () => {
  it('1 — registry preserves Ember and SocialLens after A10', () => {
    expect(registeredStoryIds()).toEqual([
      'ember',
      'sociallens',
      'incidentpilot',
      'clinical-reconciliation',
      'code-battlegrounds',
      'timesling',
      'zenco',
    ]);
    expect(hasProjectStory('ember')).toBe(true);
    expect(hasProjectStory('sociallens')).toBe(true);
  });

  it('2 — SocialLens is reached through a dynamic import, never a static one', () => {
    expect(registrySource).toMatch(/\(\)\s*=>\s*\n?\s*import\('\.\/sociallens\/SocialLensStory'\)/);
    expect(registrySource).not.toMatch(/^import\s+.*SocialLensStory/m);
    expect(registrySource).not.toMatch(/from\s+'\.\/sociallens\/SocialLensStory'/);
    const C = PROJECT_STORY_COMPONENTS['sociallens'] as unknown as { $$typeof: symbol };
    expect(String(C.$$typeof)).toContain('lazy');
    // no initial-bundle render path names the module
    for (const f of [
      'src/components/projects/FeaturedProject.tsx',
      'src/components/projects/story/ProjectStory.tsx',
    ]) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/SocialLensStory/);
    }
  });

  it('3 — unknown and unregistered ids remain safe', () => {
    for (const id of ['nostalgia', 'nope', 'constructor', '__proto__', 'toString']) {
      expect(hasProjectStory(id), id).toBe(false);
      expect(PROJECT_STORY_COMPONENTS[id], id).toBeUndefined();
    }
  });
});

// ─── 4–10 · Truthful content ────────────────────────────────────────────────
describe('A9 — SocialLens story content', () => {
  it('4 — one truthful aggregate accessible description', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = stageOf(container)!;
    expect(stage).not.toBeNull();
    const label = stage.getAttribute('aria-label')!;
    for (const concept of [
      'YouTube',
      'scheduled job',
      'channel and video metrics',
      'OAuth',
      'idempotent daily snapshots',
      'PostgreSQL',
      'REST analytics APIs',
      '7, 30 and 90 day trends',
    ]) {
      expect(label, concept).toContain(concept);
    }
    // exactly one aggregate image region — the story replaced the FlowDemo stage
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(container.querySelector('.sr-only')?.textContent).toMatch(
      /snapshots accumulate in PostgreSQL/
    );
  });

  it('5 — YouTube is the only depicted source', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const stage = stageOf(container)!;
    const text = `${stage.getAttribute('aria-label')} ${stage.textContent}`;
    expect(text).toContain('YouTube');
    expect(text.match(/YouTube/g)!.length).toBeGreaterThanOrEqual(1);
    expect(STORY_SOURCE.match(/YouTube/g)!.length).toBeGreaterThanOrEqual(1);
  });

  it('6 — no unsupported platform or analysis claims anywhere in the story', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const rendered = `${container.innerHTML}`;
    const forbidden =
      /reddit|instagram|tiktok|twitter|facebook|linkedin|multi-platform|sentiment|influencer|recommendation|recommend|predict|forecast|audience prediction|campaign optimi/i;
    expect(rendered).not.toMatch(forbidden);
    expect(STORY_SOURCE).not.toMatch(forbidden);
  });

  it('7 — idempotent snapshot storage is communicated', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const text = stageOf(container)!.textContent!;
    expect(text).toContain('Idempotent write');
    expect(text).toContain('repeat poll · stored once');
  });

  it('8 — historical / time-series accumulation is visible', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const stage = stageOf(container)!;
    const text = stage.textContent!;
    expect(text).toContain('postgresql · snapshot history');
    expect(text).toContain('day 1');
    expect(text).toContain('day 90');
    expect(text).toContain('daily snapshots');
    // the history strip is a real accumulating object, not one generic cylinder
    expect(stage.querySelector('[data-node-id="store"]')).not.toBeNull();
  });

  it('9 — REST analytics serving appears after the data accumulates', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const stage = stageOf(container)!;
    expect(stage.textContent).toContain('Analytics API');
    expect(stage.textContent).toContain('REST endpoints read stored snapshots');
    expect(stage.textContent).toContain('7 / 30 / 90-day trends');
    expect(stage.textContent).toContain('computed from accumulated history');
    const ids = [...stage.querySelectorAll('[data-story-node="primary"]')].map(n =>
      n.getAttribute('data-node-id')
    );
    expect(ids.indexOf('store')).toBeLessThan(ids.indexOf('api'));
    expect(ids.indexOf('api')).toBeLessThan(ids.indexOf('trends'));
  });

  it('10 — OAuth is present but secondary, and exposes no credential values', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const stage = stageOf(container)!;
    expect(stage.textContent).toContain('OAuth');
    expect(stage.textContent).toContain('refreshed & persisted');
    // secondary: OAuth is an inline state on the ingest node, not its own primary object
    const ids = [...stage.querySelectorAll('[data-story-node="primary"]')].map(n =>
      n.getAttribute('data-node-id')
    );
    expect(ids).not.toContain('oauth');
    expect(stage.querySelector('[data-node-id="ingest"]')!.textContent).toContain('OAuth');
    // no token-shaped strings
    expect(stage.textContent).not.toMatch(/ya29\.|Bearer\s|refresh_token|client_secret|[A-Za-z0-9_-]{30,}/);
  });
});

// ─── 11–14 · Lifecycle ──────────────────────────────────────────────────────
describe('A9 — SocialLens lifecycle', () => {
  it('11 — recruiter mode renders the complete static system, no sequence', async () => {
    const { container } = renderFeatured(SOCIALLENS, true);
    await settle();
    const text = stageOf(container)!.textContent!;
    expect(text).toContain('Static system');
    expect(text).toContain('YouTube metrics');
    expect(text).toContain('Scheduled ingest');
    expect(text).toContain('Idempotent write');
    expect(text).toContain('Analytics API');
    expect(text).toContain('7 / 30 / 90-day trends');
  });

  it('12 — reduced motion renders the complete static system', async () => {
    mockMatchMedia(true, false, 1440);
    const { container } = renderFeatured();
    await settle();
    const text = stageOf(container)!.textContent!;
    expect(text).toContain('Static system');
    expect(text).toContain('Idempotent write');
    expect(text).toContain('Analytics API');
  });

  it('13 — an offscreen story mounts no timers and never advances', async () => {
    vi.useFakeTimers();
    try {
      (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
      const { container } = render(
        <PortfolioModeProvider>
          <SocialLensStory />
        </PortfolioModeProvider>
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(8000);
      });
      expect(container.textContent).toContain('Paused offscreen');
      expect(container.textContent).toContain('awaiting scheduled refresh');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('14 — document hidden pauses the sequence', async () => {
    vi.useFakeTimers();
    try {
      setDocVisible(false);
      const { container } = render(
        <PortfolioModeProvider>
          <SocialLensStory />
        </PortfolioModeProvider>
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      const before = container.textContent;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(9000);
      });
      expect(container.textContent).toBe(before);
      expect(container.textContent).toContain('awaiting scheduled refresh');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
      setDocVisible(true);
    }
  });

  it('15a — SocialLens joins the shared competitive lifecycle, no second observer system', () => {
    expect(STORY_SOURCE).toMatch(/useStoryLifecycle\(ref,\s*\{\s*\n?\s*competitive:\s*true/);
    expect(STORY_SOURCE).not.toMatch(/new IntersectionObserver/);
  });

  it('15b — only the most-visible surface animates across Ember, SocialLens and FlowDemo', async () => {
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = CompetitiveIO;
    const ember = render(
      <PortfolioModeProvider>
        <EmberStory />
      </PortfolioModeProvider>
    );
    const lens = render(
      <PortfolioModeProvider>
        <SocialLensStory />
      </PortfolioModeProvider>
    );
    const flow = render(
      <PortfolioModeProvider>
        <FlowDemo demo={SOCIALLENS.demo as FlowDemoType} />
      </PortfolioModeProvider>
    );

    // one shared observer serves all three surfaces
    expect(CompetitiveIO.instances).toHaveLength(1);
    const obs = CompetitiveIO.instances[0];
    expect(obs.targets).toHaveLength(3);

    await act(async () => {
      obs.fire(el =>
        lens.container.contains(el) ? 0.9 : ember.container.contains(el) ? 0.4 : 0.3
      );
    });

    expect(lens.container.textContent).not.toContain('Paused offscreen');
    expect(ember.container.textContent).toContain('Paused offscreen');

    // hand the win to Ember and SocialLens must stand down
    await act(async () => {
      obs.fire(el =>
        ember.container.contains(el) ? 0.95 : lens.container.contains(el) ? 0.25 : 0.2
      );
    });
    expect(lens.container.textContent).toContain('Paused offscreen');
    expect(ember.container.textContent).not.toContain('Paused offscreen');

    ember.unmount();
    lens.unmount();
    flow.unmount();
  });
});

// ─── 16–18 · Composition & accessibility ────────────────────────────────────
describe('A9 — SocialLens composition and accessibility', () => {
  it('16a — compact composition uses at most 4 primary objects', async () => {
    mockMatchMedia(false, true, 375);
    const { container } = renderFeatured();
    await settle();
    const nodes = stageOf(container)!.querySelectorAll('[data-story-node="primary"]');
    expect(nodes.length).toBeLessThanOrEqual(4);
    const ids = [...nodes].map(n => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['source', 'ingest', 'store', 'api-trends']);
  });

  it('16b — desktop composition stays within 5–7 primary objects', async () => {
    const { container } = renderFeatured();
    await settle();
    const nodes = stageOf(container)!.querySelectorAll('[data-story-node="primary"]');
    expect(nodes.length).toBeGreaterThanOrEqual(5);
    expect(nodes.length).toBeLessThanOrEqual(7);
    const ids = [...nodes].map(n => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['source', 'ingest', 'store', 'api', 'trends']);
  });

  it('17 — no tab stops or interactive controls inside the visual', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = stageOf(container)!;
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.textContent).not.toMatch(/click|sign in|connect account/i);
  });

  it('18 — no aria-live region and no status/alert roles in the story', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = stageOf(container)!;
    expect(stage.querySelectorAll('[aria-live]')).toHaveLength(0);
    expect(stage.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(0);
  });

  it('18b — no canvas, WebGL, image, video or external request in the story source', () => {
    expect(STORY_SOURCE).not.toMatch(/<canvas|getContext|WebGL|three|<img|<video|fetch\(|new Image\(|url\(http/i);
  });
});

// ─── 19, 21 · Data freeze ───────────────────────────────────────────────────
describe('A9 — canonical data unchanged', () => {
  it('19 — SocialLens project data is untouched by A9', () => {
    expect(SOCIALLENS.title).toBe('SocialLens');
    expect(SOCIALLENS.subtitle).toBe('Creator Analytics & Intelligence Platform');
    expect(SOCIALLENS.technologies).toEqual([
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'OAuth 2.0',
      'REST APIs',
    ]);
    expect(SOCIALLENS.highlights).toHaveLength(5);
    expect(SOCIALLENS.links).toEqual({
      github: 'https://github.com/AruruGunabhiram/SocialLens',
    });
    // the demo payload survives — it is the resilience fallback
    const demo = SOCIALLENS.demo as FlowDemoType;
    expect(demo.type).toBe('flow');
    expect(demo.steps.map(s => s.id)).toEqual(['source', 'ingest', 'store', 'api']);
    expect(demo.durationMs).toBe(6400);
    // no story/animation config leaked into content data
    const blob = JSON.stringify(PROJECTS);
    for (const k of ['world', 'animation', 'story', 'camera', 'sequence']) {
      expect(blob, k).not.toContain(`"${k}"`);
    }
    expect(PROJECTS).toHaveLength(8);
  });

  it('21 — featured order unchanged', () => {
    const featured = PROJECTS.filter(p => p.featured).sort(
      (a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)
    );
    expect(featured.map(p => p.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(featured.map(p => p.featuredOrder)).toEqual([1, 2, 3]);
  });
});

// ─── 20 · Failure isolation (registered id + failing child) ─────────────────
describe('A9 — failure isolation', () => {
  it('20 — a throwing SocialLens story falls back to the existing FlowDemo', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = PROJECT_STORY_COMPONENTS['sociallens'];
    function Boom(): never {
      throw new Error('chunk load failed');
    }
    Object.defineProperty(PROJECT_STORY_COMPONENTS, 'sociallens', {
      value: Boom,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    try {
      const { container } = render(
        <PortfolioModeProvider>
          <ProjectStory
            projectId="sociallens"
            fallback={<FlowDemo demo={SOCIALLENS.demo as FlowDemoType} />}
          />
        </PortfolioModeProvider>
      );
      await settle();
      const flow = container.querySelector('[role="img"]')!;
      expect(flow).not.toBeNull();
      expect(flow.getAttribute('aria-label')).toContain('SocialLens processing flow');
      expect(container.textContent).toContain('PostgreSQL time-series store');
      expect(stageOf(container)).toBeNull();
    } finally {
      Object.defineProperty(PROJECT_STORY_COMPONENTS, 'sociallens', {
        value: original,
        configurable: true,
        enumerable: true,
        writable: true,
      });
      err.mockRestore();
    }
  });
});

// ─── 22 · Ember regression ──────────────────────────────────────────────────
describe('A9 — Ember unaffected', () => {
  it('22 — Ember still renders its own story with its own labels', async () => {
    const { container } = renderFeatured(EMBER, true);
    await settle();
    const stage = container.querySelector('[role="img"]')!;
    expect(stage.getAttribute('aria-label')).toContain('durable orchestrator');
    expect(stage.textContent).toContain('Deterministic gate');
    expect(stage.textContent).toContain('Controlled worker');
    // and it is not the SocialLens visual
    expect(stage.textContent).not.toContain('Scheduled ingest');
    expect(stage.textContent).not.toContain('YouTube');
  });
});
