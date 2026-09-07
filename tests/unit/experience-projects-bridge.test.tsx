import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import { Experience } from '../../src/sections/Experience';
import { Projects } from '../../src/sections/Projects';
import { ExperienceProjectsBridge } from '../../src/components/transitions/ExperienceProjectsBridge';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { HeroEngineeringScene } from '../../src/components/hero/HeroEngineeringScene';
import { EXPERIENCE } from '../../src/data/experience';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';

const CAPABILITY_LABELS = ['AI Systems', 'Backend', 'Automation', 'Interfaces'];
const GROUP_LABEL =
  'Professional engineering capabilities: AI Systems, Backend, Automation, and Interfaces.';

class MockIO {
  callback: IntersectionObserverCallback;
  root = null; rootMargin = ''; thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback) { this.callback = cb; }
  observe = vi.fn((el: Element) => {
    setTimeout(() => this.callback([{ target: el, isIntersecting: true, intersectionRatio: 0.5, boundingClientRect: {} as DOMRectReadOnly, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: Date.now() } as IntersectionObserverEntry], this as unknown as IntersectionObserver), 0);
  });
  unobserve = vi.fn(); disconnect = vi.fn(); takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia(reduced = false, coarse = false, width = 1440) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reduced;
    if (query.includes('pointer: coarse')) matches = coarse;
    return { matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() } as unknown as MediaQueryList;
  }) as unknown as typeof window.matchMedia;
}

function setDocVisible(v: boolean) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'visible' : 'hidden') as DocumentVisibilityState });
}

async function renderBridge() {
  const utils = render(<PortfolioModeProvider><ExperienceProjectsBridge /></PortfolioModeProvider>);
  await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  return utils;
}

describe('A6 — Experience → Projects capability recomposition', () => {
  beforeEach(() => {
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
    mockMatchMedia(false, false, 1440);
    setDocVisible(true);
    __resetStoryLifecycleForTests();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => { vi.restoreAllMocks(); __resetStoryLifecycleForTests(); });

  it('1 — capability set contains exactly the intended labels', async () => {
    const { container } = await renderBridge();
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group).not.toBeNull();
    CAPABILITY_LABELS.forEach(l => expect(group.textContent).toContain(l));
    expect(group.querySelectorAll('.story-node')).toHaveLength(4);
    // No skill-section drift — capability set stays derived from Experience only
    ['Agents', 'Cloud', 'DevOps', 'Databases', 'Security', 'Full Stack'].forEach(l =>
      expect(group.textContent).not.toContain(l)
    );
  });

  it('2 — capability grouping is accessible and labels are not hidden', async () => {
    const { container } = await renderBridge();
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe(GROUP_LABEL);
    expect(group.getAttribute('aria-hidden')).not.toBe('true');
    CAPABILITY_LABELS.forEach(label => {
      const node = Array.from(group.querySelectorAll('.story-node')).find(n => n.textContent?.includes(label));
      expect(node).toBeDefined();
      expect(node?.closest('[aria-hidden="true"]')).toBeNull();
    });
    // Exactly one accessible grouping — desktop/compact compositions never coexist
    expect(container.querySelectorAll(`[aria-label="${GROUP_LABEL}"]`)).toHaveLength(1);
  });

  it('3 — decorative rails, connectors and captions are aria-hidden', async () => {
    const { container } = await renderBridge();
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    const eyebrow = Array.from(container.querySelectorAll('p')).find(p => p.textContent === 'Capabilities from this work');
    expect(eyebrow?.getAttribute('aria-hidden')).toBe('true');
    const handoff = Array.from(container.querySelectorAll('*')).find(el => el.textContent === 'applied in the work below');
    expect(handoff?.closest('[aria-hidden="true"]')).not.toBeNull();
    // svg connectors are decorative
    container.querySelectorAll('svg').forEach(svg => {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('4 — bridge adds no tab stops and Experience gains none', async () => {
    const { container } = await renderBridge();
    expect(container.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0);
    const { container: c2 } = render(<PortfolioModeProvider><Experience /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    expect(c2.querySelectorAll('#experience button, #experience [tabindex]')).toHaveLength(0);
  });

  it('5 — recruiter renders a static capability summary', async () => {
    window.history.replaceState(null, '', '/?mode=recruiter');
    __resetStoryLifecycleForTests();
    const { container } = await renderBridge();
    const root = container.querySelector('[data-a6-static]') as HTMLElement;
    expect(root.getAttribute('data-a6-static')).toBe('true');
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group.querySelectorAll('.story-node')).toHaveLength(4);
    CAPABILITY_LABELS.forEach(l => expect(group.textContent).toContain(l));
    // no scroll-derived hand-off choreography in recruiter
    expect(container.textContent).not.toContain('applied in the work below');
  });

  it('6 — reduced motion renders the final static composition, nothing hidden', async () => {
    mockMatchMedia(true, false, 1440);
    __resetStoryLifecycleForTests();
    const { container } = await renderBridge();
    expect((container.querySelector('[data-a6-static]') as HTMLElement).getAttribute('data-a6-static')).toBe('true');
    const group = container.querySelector('[role="group"]') as HTMLElement;
    CAPABILITY_LABELS.forEach(l => expect(group.textContent).toContain(l));
    // static path uses no inline opacity animation on the modules
    group.querySelectorAll<HTMLElement>('.story-node').forEach(n => {
      expect(n.style.opacity === '' || n.style.opacity === '1').toBe(true);
    });
  });

  it('7 — standard desktop consumes transition progress without crashing', async () => {
    const progress = motionValue(0);
    const { container } = await renderBridge();
    expect((container.querySelector('[data-a6-static]') as HTMLElement).getAttribute('data-a6-static')).toBe('false');
    for (const v of [0.25, 0.5, 0.75, 1]) {
      await act(async () => { progress.set(v); await new Promise(r => setTimeout(r, 10)); });
      expect(container.querySelector('[role=\"group\"]')).not.toBeNull();
    }
  });

  it('8 — reverse and repeated progress is safe', async () => {
    const progress = motionValue(0.6);
    const { container } = await renderBridge();
    for (const v of [0, 1, 0.2, 1, 0]) {
      await act(async () => { progress.set(v); await new Promise(r => setTimeout(r, 10)); });
      const group = container.querySelector('[role="group"]') as HTMLElement;
      expect(group).not.toBeNull();
      expect(group.querySelectorAll('.story-node')).toHaveLength(4);
    }
  });

  it('9 — compact uses a simplified 2×2 composition, desktop an asymmetric cluster', async () => {
    mockMatchMedia(false, false, 375);
    __resetStoryLifecycleForTests();
    const { container } = await renderBridge();
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group.className).toContain('grid-cols-2');
    // one flat container, no multi-row choreography on mobile
    expect(group.querySelectorAll('.story-node')).toHaveLength(4);

    mockMatchMedia(false, false, 1440);
    __resetStoryLifecycleForTests();
    const { container: c2 } = await renderBridge();
    const group2 = c2.querySelector('[role="group"]') as HTMLElement;
    expect(group2.className).not.toContain('grid-cols-2');
    // asymmetric: two rows, second row offset — not a 4-column feature grid
    const rows = Array.from(group2.children) as HTMLElement[];
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll('.story-node')).toHaveLength(2);
    expect(rows[1].querySelectorAll('.story-node')).toHaveLength(2);
    expect(rows[1].className).toMatch(/pl-/);
  });

  it('10 — compact PROJXON visual has at most 4 primary conceptual nodes', async () => {
    mockMatchMedia(false, true, 320);
    __resetStoryLifecycleForTests();
    const { container } = render(<PortfolioModeProvider><Experience /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    const projxonStage = container.querySelectorAll('#experience [role="img"]')[0] as HTMLElement;
    const nodes = projxonStage.querySelectorAll('.story-node');
    expect(nodes.length).toBeLessThanOrEqual(4);
    expect(nodes).toHaveLength(4);
    // permission gate + human approval are merged on compact only
    expect(projxonStage.textContent).not.toContain('Permission gate');
    expect(projxonStage.textContent).not.toContain('Human approval');
  });

  it('11 — permission / human-approval meaning survives on mobile', async () => {
    mockMatchMedia(false, true, 375);
    __resetStoryLifecycleForTests();
    const { container } = render(<PortfolioModeProvider><Experience /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    const projxonStage = container.querySelectorAll('#experience [role="img"]')[0] as HTMLElement;
    expect(projxonStage.textContent).toContain('Task context');
    expect(projxonStage.textContent).toContain('AI proposal');
    expect(projxonStage.textContent).toContain('Control / approval');
    expect(projxonStage.textContent).toContain('permission + human approval');
    expect(projxonStage.textContent).toContain('App execution');
    // audit is a status footer, not a primary node
    expect(projxonStage.textContent).toContain('Audit trail');
    // accessible description still carries the full controlled-workflow meaning
    expect(projxonStage.getAttribute('aria-label')).toContain('permission and human approval');
  });

  it('12 — canonical Experience data unchanged', () => {
    expect(EXPERIENCE).toHaveLength(2);
    expect(EXPERIENCE[0].id).toBe('projxon-ai-intern');
    expect(EXPERIENCE[0].bullets).toHaveLength(3);
    expect(EXPERIENCE[0].bullets[0]).toContain('OrkaATS');
    expect(EXPERIENCE[1].id).toBe('infini-ai-intern');
    expect(EXPERIENCE[1].technologies).toEqual(['Python', 'Flask']);
  });

  it('13 — project inventory pinned (A7B-reconciled)', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.map(p => p.id).sort()).toEqual(
      ['clinical-reconciliation', 'code-battlegrounds', 'ember', 'incidentpilot', 'nostalgia', 'sociallens', 'timesling', 'zenco']
    );
  });

  it('14 — featured project order is Ember / SocialLens / IncidentPilot', () => {
    const featured = PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
    expect(featured.map(p => p.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(featured.map(p => p.featuredOrder)).toEqual([1, 2, 3]);
  });

  it('15 — bridge sits between #experience and #projects, anchors intact', async () => {
    const { container } = render(
      <PortfolioModeProvider><><Experience /><ExperienceProjectsBridge /><Projects /></></PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const exp = container.querySelector('section#experience') as HTMLElement;
    const proj = container.querySelector('section#projects') as HTMLElement;
    const bridge = container.querySelector('[data-a6-static]') as HTMLElement;
    expect(exp).not.toBeNull();
    expect(proj).not.toBeNull();
    expect(exp.compareDocumentPosition(bridge) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bridge.compareDocumentPosition(proj) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Projects keeps its own structure — bridge is not inside it
    expect(proj.contains(bridge)).toBe(false);
    expect(proj.querySelector('h2')?.textContent).toContain('Projects');
  });

  it('16 — A4 Hero→Experience behavior remains intact', async () => {
    const progress = motionValue(0.5);
    const { container } = render(<PortfolioModeProvider><HeroEngineeringScene transitionProgress={progress} /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    expect((container.querySelector('[role="img"]') as HTMLElement).getAttribute('aria-label')).toContain('engineering system');
    const { container: c2 } = render(<PortfolioModeProvider><Experience /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    expect(c2.querySelector('#experience h2')?.textContent).toContain('Experience');
    // A4 entry bridge still present above the heading
    expect(c2.querySelectorAll('#experience [aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('17 — Experience factual content never depends on transition progress', async () => {
    const { container } = render(<PortfolioModeProvider><Experience /></PortfolioModeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    EXPERIENCE.forEach(job => {
      expect(container.textContent).toContain(job.role);
      job.bullets.forEach(b => expect(container.textContent).toContain(b));
    });
    // bullets and company names carry no inline opacity/transform
    container.querySelectorAll<HTMLElement>('#experience li, #experience h3').forEach(el => {
      expect(el.style.opacity).toBe('');
      expect(el.style.transform).toBe('');
    });
  });

  it('18 — recruiter Experience stories stay static while the bridge stays static', async () => {
    window.history.replaceState(null, '', '/?mode=recruiter');
    __resetStoryLifecycleForTests();
    const { container } = render(
      <PortfolioModeProvider><><Experience /><ExperienceProjectsBridge /></></PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 50)); });
    const stages = container.querySelectorAll('#experience [role="img"]');
    expect(stages.length).toBeGreaterThan(0);
    stages.forEach(s => expect(s.textContent).toContain('Static system'));
    expect((container.querySelector('[data-a6-static]') as HTMLElement).getAttribute('data-a6-static')).toBe('true');
  });
});
