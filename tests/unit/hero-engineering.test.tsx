import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from '../../src/sections/Hero';
import { HeroEngineeringScene } from '../../src/components/hero/HeroEngineeringScene';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { ThemeProvider } from '../../src/context';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import { PROFILE } from '../../src/data/profile';
import { CONTACT } from '../../src/data/contact';

// Mock IntersectionObserver for useStoryLifecycle
class MockIO implements IntersectionObserver {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }
  observe = vi.fn((el: Element) => {
    // Immediately trigger visible for Hero (non-competitive, threshold 0.2)
    // Simulate isIntersecting true ratio 0.5
    // @ts-ignore trigger async to allow effect
    setTimeout(() => {
      this.callback(
        [
          {
            target: el,
            isIntersecting: true,
            intersectionRatio: 0.5,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver
      );
    }, 0);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia(reduced: boolean, coarse = false, width = 1024) {
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

function setDocVisible(visible: boolean) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (visible ? 'visible' : 'hidden') as DocumentVisibilityState,
  });
}

function renderHeroWithProviders(mode: 'standard' | 'recruiter' = 'standard') {
  if (mode === 'recruiter') window.history.replaceState(null, '', '/?mode=recruiter');
  else window.history.replaceState(null, '', '/');
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <PortfolioModeProvider>
          <Hero />
        </PortfolioModeProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderSceneDirect(reduced = false, coarse = false, width = 1024, recruiter = false) {
  mockMatchMedia(reduced, coarse, width);
  if (recruiter) window.history.replaceState(null, '', '/?mode=recruiter');
  else window.history.replaceState(null, '', '/');
  // @ts-ignore
  global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
  return render(
    <PortfolioModeProvider>
      <HeroEngineeringScene />
    </PortfolioModeProvider>
  );
}

describe('A3 — Hero Engineering Scene', () => {
  beforeEach(() => {
    // @ts-ignore
    global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    mockMatchMedia(false, false, 1024);
    setDocVisible(true);
    __resetStoryLifecycleForTests();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    __resetStoryLifecycleForTests();
  });

  it('1 — scene exposes one aggregate accessible description (role img)', async () => {
    const { container } = renderSceneDirect(false, false, 1024, false);
    // wait for IO
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage).not.toBeNull();
    expect(stage.getAttribute('aria-label')).toBe('An engineering system linking a workstation, API service, database, cloud infrastructure, and AI service.');
    const sr = stage.querySelector('.sr-only');
    expect(sr).not.toBeNull();
    expect(sr?.textContent).toContain('Workstation with code connects');
    // exactly one stage per mount
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
  });

  it('2 — decorative objects do not create tab stops', async () => {
    const { container } = renderSceneDirect(false, false, 1024, false);
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    const focusable = stage.querySelectorAll('a, button, [tabindex="0"]');
    expect(focusable.length).toBe(0);
    // connectors and packet are aria-hidden
    const hiddens = stage.querySelectorAll('[aria-hidden="true"]');
    expect(hiddens.length).toBeGreaterThan(3);
    expect(stage.getAttribute('aria-live')).toBeNull();
  });

  it('3 — recruiter → static scene (no ambient)', async () => {
    const { container } = renderSceneDirect(false, false, 1024, true);
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // static footer text
    expect(stage.textContent).toContain('Static system');
    expect(stage.textContent).not.toContain('Ambient');
  });

  it('4 — reduced motion → static scene', async () => {
    const { container } = renderSceneDirect(true, false, 1024, false);
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage.textContent).toContain('Static system');
    expect(stage.textContent).not.toContain('Ambient');
  });

  it('5 — compact mode renders compact composition (2 nodes vs desktop 5)', async () => {
    // compact: width 500 coarse false → true
    const { container: cCompact } = renderSceneDirect(false, false, 500, false);
    await new Promise(r => setTimeout(r, 20));
    const compactStage = cCompact.querySelector('[role="img"]') as HTMLElement;
    // compact has single Cloud·AI combined, not separate Cloud+AI+DB separately
    expect(compactStage.textContent).toContain('Cloud · AI');
    expect(compactStage.textContent).not.toContain('PostgreSQL'); // desktop DB label

    // desktop
    __resetStoryLifecycleForTests();
    mockMatchMedia(false, false, 1024);
    const { container: cDesk } = renderSceneDirect(false, false, 1024, false);
    await new Promise(r => setTimeout(r, 20));
    const deskStage = cDesk.querySelector('[role="img"]') as HTMLElement;
    expect(deskStage.textContent).toContain('PostgreSQL');
    expect(deskStage.textContent).toContain('workstation');
  });

  it('6 — standard eligible desktop → ambient state enabled', async () => {
    const { container } = renderSceneDirect(false, false, 1024, false);
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // after IO visible, should be ambient
    expect(stage.textContent).toContain('Ambient');
  });

  it('7 — document hidden → ambient disabled (falls back to static?)', async () => {
    setDocVisible(false);
    __resetStoryLifecycleForTests();
    const { container } = renderSceneDirect(false, false, 1024, false);
    await new Promise(r => setTimeout(r, 20));
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // Document hidden forces shouldAnimate false → static
    expect(stage.textContent).toContain('Static system');
  });

  it('8 — scene does not alter Hero heading hierarchy', async () => {
    const { container } = renderHeroWithProviders('standard');
    // wait a tick
    await new Promise(r => setTimeout(r, 10));
    const h1 = container.querySelector('#hero-heading') as HTMLElement;
    expect(h1).not.toBeNull();
    expect(h1.tagName).toBe('H1');
    expect(h1.textContent).toBe(PROFILE.name);
    // only one h1 in hero
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    // h1 still before scene in DOM order? Check heading precedes img
    const heroSection = container.querySelector('#hero') as HTMLElement;
    const html = heroSection.innerHTML;
    const h1Pos = html.indexOf('hero-heading');
    const imgPos = html.indexOf('role="img"');
    expect(h1Pos).toBeLessThan(imgPos);
  });

  it('9 — existing Hero CTA behavior remains', async () => {
    const { container } = renderHeroWithProviders('standard');
    await new Promise(r => setTimeout(r, 10));
    const explore = Array.from(container.querySelectorAll('a')).find(a => a.textContent?.includes('Explore Projects')) as HTMLAnchorElement;
    expect(explore).not.toBeUndefined();
    expect(explore.getAttribute('href')).toBe('#projects');
    const resume = Array.from(container.querySelectorAll('a')).find(a => a.textContent?.includes('View Resume')) as HTMLAnchorElement;
    expect(resume).not.toBeUndefined();
    expect(resume.getAttribute('href')).toBe(CONTACT.resumeUrl);

    // recruiter mode swaps order: Resume first
    const { container: c2 } = renderHeroWithProviders('recruiter');
    await new Promise(r => setTimeout(r, 10));
    const anchors = Array.from(c2.querySelectorAll('a')).map(a => a.textContent?.trim());
    const resumeIdx = anchors.findIndex(t => t?.includes('View Resume'));
    const exploreIdx = anchors.findIndex(t => t?.includes('Explore Projects'));
    expect(resumeIdx).toBeLessThan(exploreIdx);
  });

  it('10 — no project/content facts were introduced', async () => {
    const { container } = renderHeroWithProviders('standard');
    const text = container.textContent ?? '';
    // ensure no invented project names appear in Hero
    expect(text).not.toContain('Clinical');
    expect(text).not.toContain('Reconciliation');
    expect(text).not.toContain('Extinction');
    expect(text).not.toContain('Ember');
    // scene labels are generic system terms, not project claims
    expect(text).not.toMatch(/SocialLens.*API.*Database.*Cloud.*AI/); // not leaking project facts
  });
});
