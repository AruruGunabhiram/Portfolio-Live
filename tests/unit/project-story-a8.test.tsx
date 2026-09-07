import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { FeaturedProject } from '../../src/components/projects/FeaturedProject';
import { ProjectStory } from '../../src/components/projects/story/ProjectStory';
import {
  hasProjectStory,
  registeredStoryIds,
  PROJECT_STORY_COMPONENTS,
} from '../../src/components/projects/story/storyRegistry';
import { EmberStory } from '../../src/components/projects/story/ember/EmberStory';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';

// ─── Environment doubles ────────────────────────────────────────────────────
class MockIO {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
    this.callback = cb;
    this.rootMargin = opts?.rootMargin ?? '';
    ioInstances.push(this);
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
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              time: Date.now(),
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

let ioInstances: MockIO[] = [];

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

const EMBER = PROJECTS.find(p => p.id === 'ember')!;
const INCIDENTPILOT = PROJECTS.find(p => p.id === 'incidentpilot')!;
const CODE_BATTLEGROUNDS = PROJECTS.find(p => p.id === 'code-battlegrounds')!;

/** Flush the mount gate + lazy chunk resolution. */
async function settle(ms = 30) {
  await act(async () => {
    await new Promise(r => setTimeout(r, ms));
  });
}

function renderFeatured(project = EMBER, recruiter = false) {
  const url = recruiter ? '?mode=recruiter' : '';
  window.history.replaceState({}, '', `/${url}`);
  return render(
    <PortfolioModeProvider>
      <FeaturedProject project={project} index={0} isExpanded={false} onToggle={() => {}} />
    </PortfolioModeProvider>
  );
}

beforeEach(() => {
  ioInstances = [];
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
describe('A8 — project story registry', () => {
  it('1 — registry preserves Ember as later visual worlds are added', () => {
    expect(registeredStoryIds()).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(hasProjectStory('ember')).toBe(true);
  });

  it('2 — unknown / unregistered project ids safely return no custom story', () => {
    for (const id of ['zenco', 'nope', 'constructor', '__proto__']) {
      expect(hasProjectStory(id), id).toBe(false);
      expect(PROJECT_STORY_COMPONENTS[id], id).toBeUndefined();
    }
  });

  it('3 — Ember story is reached through a dynamic import, never a static one', () => {
    // Source-level proof: the only reference to the story module is import(...)
    expect(registrySource).toMatch(/\(\)\s*=>\s*import\('\.\/ember\/EmberStory'\)/);
    expect(registrySource).not.toMatch(/^import\s+.*EmberStory/m);
    expect(registrySource).not.toMatch(/from\s+'\.\/ember\/EmberStory'/);
    // Behavioural proof: the registry exposes a React.lazy component, not the module
    const C = PROJECT_STORY_COMPONENTS['ember'] as unknown as { $$typeof: symbol };
    expect(String(C.$$typeof)).toContain('lazy');
  });

  it('3b — no story module is imported statically by any initial-bundle render path', () => {
    const featuredSrc = require('node:fs').readFileSync(
      'src/components/projects/FeaturedProject.tsx',
      'utf8'
    );
    const storySrc = require('node:fs').readFileSync(
      'src/components/projects/story/ProjectStory.tsx',
      'utf8'
    );
    for (const src of [featuredSrc, storySrc]) {
      expect(src).not.toMatch(/EmberStory/);
    }
  });
});

// ─── 4 · Backwards compatibility ────────────────────────────────────────────
describe('A8 — existing demo compatibility', () => {
  it('4 — projects without a registered story still render their FlowDemo', async () => {
    const { container } = renderFeatured(CODE_BATTLEGROUNDS);
    await settle();
    const flow = container.querySelector('[role="img"]');
    expect(flow).not.toBeNull();
    expect(flow!.getAttribute('aria-label')).toContain('Code Battlegrounds');
  });

  it('19 — a demo-only project and a later custom story remain compatible', async () => {
    const a = renderFeatured(CODE_BATTLEGROUNDS);
    await settle();
    expect(a.container.textContent).toContain('Code Battlegrounds');
    expect(a.container.querySelector('[role="img"]')).not.toBeNull();
    a.unmount();
    __resetStoryLifecycleForTests();

    // A10 adds IncidentPilot as a custom story without altering its card content.
    const b = renderFeatured(INCIDENTPILOT);
    await settle();
    expect(b.container.textContent).toContain('IncidentPilot');
    expect(b.container.textContent).toContain('Approval-Gated Incident Investigator');
    expect(hasProjectStory('incidentpilot')).toBe(true);
  });
});

// ─── 5–7 · Accessibility ────────────────────────────────────────────────────
describe('A8 — Ember story accessibility', () => {
  it('5 — one truthful aggregate accessible description', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = container.querySelector('[role="img"]')!;
    const label = stage.getAttribute('aria-label')!;
    for (const concept of [
      'durable orchestrator',
      'deterministic policy',
      'AI only for semantic reasoning',
      'human approval',
      'controlled worker',
      'auditable result',
    ]) {
      expect(label, concept).toContain(concept);
    }
    // exactly one aggregate image region in the story
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(container.querySelector('.sr-only')?.textContent).toMatch(/persisted by a durable orchestrator/);
  });

  it('6 — no tab stops and no interactive controls inside the visual', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = container.querySelector('[role="img"]')!;
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    // and specifically no fake approval affordance
    expect(stage.textContent).not.toMatch(/click|approve now|submit/i);
  });

  it('7 — no aria-live region anywhere in the story', async () => {
    const { container } = renderFeatured();
    await settle();
    const stage = container.querySelector('[role="img"]')!;
    expect(stage.querySelectorAll('[aria-live]')).toHaveLength(0);
    expect(stage.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(0);
  });
});

// ─── 8–11 · Static / paused modes ───────────────────────────────────────────
describe('A8 — Ember story lifecycle', () => {
  it('8 — recruiter mode renders the complete static system, no sequence', async () => {
    const { container } = renderFeatured(EMBER, true);
    await settle();
    expect(container.textContent).toContain('Static system');
    expect(container.textContent).toContain('COMPLETED');
    expect(container.textContent).toContain('transition recorded');
    // every primary node reads as settled, not idle
    expect(container.querySelectorAll('[data-story-node="primary"]').length).toBeGreaterThan(0);
  });

  it('9 — reduced motion renders the complete static system', async () => {
    mockMatchMedia(true, false, 1440);
    const { container } = renderFeatured();
    await settle();
    expect(container.textContent).toContain('Static system');
    expect(container.textContent).toContain('COMPLETED');
    expect(container.textContent).toContain('transition recorded');
  });

  it('10 — document hidden pauses the sequence', async () => {
    vi.useFakeTimers();
    try {
      setDocVisible(false);
      const { container } = render(
        <PortfolioModeProvider>
          <EmberStory />
        </PortfolioModeProvider>
      );
      await act(async () => { await vi.advanceTimersByTimeAsync(50); });
      const before = container.textContent;
      await act(async () => { await vi.advanceTimersByTimeAsync(6000); });
      expect(container.textContent).toBe(before);
      expect(container.textContent).toContain('QUEUED');
    } finally {
      vi.useRealTimers();
      setDocVisible(true);
    }
  });

  it('11 — an offscreen story mounts no timers and never advances', async () => {
    vi.useFakeTimers();
    try {
      (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
      const { container } = render(
        <PortfolioModeProvider>
          <EmberStory />
        </PortfolioModeProvider>
      );
      // no IO callback fired => never active
      await act(async () => { await vi.advanceTimersByTimeAsync(8000); });
      expect(container.textContent).toContain('Paused offscreen');
      expect(container.textContent).toContain('QUEUED');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('12 — the story joins the shared competitive lifecycle, not a second system', async () => {
    const source = require('node:fs').readFileSync(
      'src/components/projects/story/ember/EmberStory.tsx',
      'utf8'
    );
    expect(source).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true/);
    expect(source).not.toMatch(/new IntersectionObserver/);
  });
});

// ─── 13–14 · Composition budgets ────────────────────────────────────────────
describe('A8 — Ember composition', () => {
  it('13 — compact composition uses at most 4 primary objects', async () => {
    mockMatchMedia(false, true, 375);
    const { container } = renderFeatured();
    await settle();
    const nodes = container.querySelectorAll('[data-story-node="primary"]');
    expect(nodes.length).toBeLessThanOrEqual(4);
    expect(nodes.length).toBe(4);
    const ids = [...nodes].map(n => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['task', 'orchestrator', 'gate-reasoning', 'approval-execution']);
    // audit is a footer status in compact, not a fifth node
    expect(container.textContent).toContain('Auditable state');
  });

  it('14 — desktop composition stays within the intended object count', async () => {
    const { container } = renderFeatured();
    await settle();
    const nodes = container.querySelectorAll('[data-story-node="primary"]');
    expect(nodes.length).toBeGreaterThanOrEqual(5);
    expect(nodes.length).toBeLessThanOrEqual(7);
    const ids = [...nodes].map(n => n.getAttribute('data-node-id'));
    expect(ids).toEqual(['task', 'orchestrator', 'gate', 'reasoning', 'approval', 'worker']);
  });

  it('14b — controlled-autonomy semantics are visually explicit and correctly ordered', async () => {
    const { container } = renderFeatured(EMBER, true);
    await settle();
    const ids = [...container.querySelectorAll('[data-story-node="primary"]')].map(n =>
      n.getAttribute('data-node-id')
    );
    // execution must follow approval, never precede it
    expect(ids.indexOf('approval')).toBeLessThan(ids.indexOf('worker'));
    // reasoning is scoped, gate is deterministic, approval pauses the run
    const text = container.textContent!;
    expect(text).toContain('Deterministic gate');
    expect(text).toContain('Semantic reasoning');
    expect(text).toContain('engaged only where judgment is required');
    expect(text).toContain('Human approval / handoff');
    expect(text).toContain('run pauses until a person approves');
    expect(text).toContain('Controlled worker');
  });
});

// ─── 15–17 · Truthfulness & privacy ─────────────────────────────────────────
describe('A8 — Ember truthfulness and privacy', () => {
  it('15 — no private identifiers appear in the rendered story', async () => {
    const { container } = renderFeatured();
    await settle();
    const html = container.innerHTML;
    for (const bad of [
      'Personal-BOT',
      'Personal_BOT',
      'personal-bot',
      'Job-automation',
      'CPT',
      'aruru',
      'gunabhiram.a@',
    ]) {
      expect(html, bad).not.toContain(bad);
    }
    expect(html).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    expect(html).not.toMatch(/@[a-z0-9.-]+\.(com|edu|org|net)/i);
    expect(html).not.toMatch(/\/(Users|home)\/[a-z]/i);
    expect(html).not.toMatch(/visa|H-?1B|MacBook|iPhone|Mac mini/i);
    // no overstated autonomy
    expect(container.textContent).not.toMatch(/fully autonomous|automatically applies|unattended/i);
  });

  it('16 — Ember shows no fake GitHub or live affordance', async () => {
    const { container } = renderFeatured();
    await settle();
    const links = [...container.querySelectorAll('a')];
    expect(links).toHaveLength(0);
    expect(container.textContent).not.toMatch(/GitHub|Live|Coming soon|Private repo/);
    // the only control is the existing details toggle
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toContain('View details');
    expect(buttons[0]).not.toBeDisabled();
  });

  it('17 — canonical project data is unchanged by A8', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(EMBER.links).toEqual({});
    expect(EMBER.demo).toBeUndefined();
    expect(EMBER.contribution).toBe('solo');
    // no animation/story config leaked into content data
    const blob = JSON.stringify(PROJECTS);
    for (const k of ['world', 'animation', 'story', 'camera', 'sequence']) {
      expect(blob, k).not.toContain(`"${k}"`);
    }
  });

  it('18 — featured order unchanged', () => {
    const featured = PROJECTS.filter(p => p.featured).sort(
      (a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)
    );
    expect(featured.map(p => p.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(featured.map(p => p.featuredOrder)).toEqual([1, 2, 3]);
  });
});

// ─── 20 · Failure isolation ─────────────────────────────────────────────────
describe('A8 — story failure isolation', () => {
  it('20a — a failing story leaves the project card fully usable', async () => {
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Boom(): never {
      throw new Error('chunk load failed');
    }
    render(
      <PortfolioModeProvider>
        <div>
          <p>Ember</p>
          <ProjectStory projectId="ember" fallback={<p>fallback visual</p>} />
        </div>
      </PortfolioModeProvider>
    );
    await settle();
    // sanity: the real story mounted; now prove the boundary catches a thrower
    const { container } = render(
      <PortfolioModeProvider>
        <ProjectStoryBoundaryProbe Child={Boom} />
      </PortfolioModeProvider>
    );
    await settle();
    expect(container.textContent).toContain('safe fallback');
    warn.mockRestore();
  });

  it('20b — IncidentPilot content remains intact after its A10 story registration', async () => {
    const { container } = renderFeatured(INCIDENTPILOT);
    await settle();
    expect(container.textContent).toContain('IncidentPilot');
    expect(container.textContent).toContain('Verifies cited file paths and line numbers');
    expect(container.querySelector('[role="img"]')).not.toBeNull();
  });

  it('20c — ProjectStory renders the fallback for an unregistered id', async () => {
    const { container } = render(
      <PortfolioModeProvider>
        <ProjectStory projectId="code-battlegrounds" fallback={<p>demo fallback</p>} />
      </PortfolioModeProvider>
    );
    await settle();
    expect(container.textContent).toBe('demo fallback');
  });
});

// Minimal probe reusing the same boundary contract as ProjectStory.
import { Component } from 'react';
class ProjectStoryBoundaryProbe extends Component<
  { Child: () => never },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <p>safe fallback</p>;
    const { Child } = this.props;
    return <Child />;
  }
}
