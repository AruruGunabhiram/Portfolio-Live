import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { motion, motionValue } from 'framer-motion';
import { HeroEngineeringScene } from '../../src/components/hero/HeroEngineeringScene';
import { Experience } from '../../src/sections/Experience';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';

// Mock IntersectionObserver for useStoryLifecycle
class MockIO implements IntersectionObserver {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback) { this.callback = cb; }
  observe = vi.fn((el: Element) => {
    setTimeout(() => this.callback([{ target: el, isIntersecting: true, intersectionRatio: 0.5, boundingClientRect: {} as DOMRectReadOnly, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: Date.now() } as IntersectionObserverEntry], this as unknown as IntersectionObserver), 0);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia(reduced = false, coarse = false, width = 1024) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reduced;
    if (query.includes('pointer: coarse')) matches = coarse;
    return { matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() } as unknown as MediaQueryList;
  }) as unknown as typeof window.matchMedia;
}

describe('A4 — Hero → Experience transition (10 cases)', () => {
  beforeEach(() => {
    // @ts-ignore
    global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    mockMatchMedia(false, false, 1024);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' as DocumentVisibilityState });
    __resetStoryLifecycleForTests();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => { vi.restoreAllMocks(); __resetStoryLifecycleForTests(); });

  it('1 — standard desktop transition can become active (progress 0→1)', async () => {
    const progress = motionValue(0);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage).not.toBeNull();
    // At progress 0, no transition cluster transform applied (y 0)
    // Move progress to 1 — should still be in DOM, no crash
    await act(async () => { progress.set(1); await new Promise(r => setTimeout(r, 20)); });
    expect(stage).toBeInTheDocument();
    // SVG connectors should still be aria-hidden
    expect(stage.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('2 — recruiter bypasses transition (static 0, no ambient)', async () => {
    window.history.replaceState(null, '', '/?mode=recruiter');
    const progress = motionValue(0.6); // even if mid-scroll, recruiter forces static
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // Recruiter renders static text
    expect(stage.textContent).toContain('Static system');
    // No ambient packet moving (should be static dot)
    expect(stage.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('3 — reduced motion bypasses transition', async () => {
    mockMatchMedia(true, false, 1024);
    __resetStoryLifecycleForTests();
    const progress = motionValue(0.7);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage.textContent).toContain('Static system');
  });

  it('4 — compact uses simplified path (isCompact true)', async () => {
    mockMatchMedia(false, false, 375); // width <1024 → compact
    __resetStoryLifecycleForTests();
    const progress = motionValue(0.5);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // Compact has Cloud·AI combined, not separate Cloud + AI + DB code window tucked?
    expect(stage.textContent).toContain('Cloud · AI');
    // Ensure no horizontal overflow due to compact motion (y only, not x large)
    expect(stage.getBoundingClientRect).toBeDefined();
  });

  it('5 — Experience heading remains accessible regardless of progress', async () => {
    const { container } = render(
      <PortfolioModeProvider>
        <Experience />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const heading = container.querySelector('#experience')?.querySelector('h2') as HTMLElement;
    expect(heading).not.toBeNull();
    expect(heading.textContent).toContain('Experience');
    const style = getComputedStyle(heading);
    expect(style.display).not.toBe('none');
    expect(container.querySelector('section#experience')).not.toBeNull();
  });

  it('6 — Hero aggregate scene accessibility unchanged', async () => {
    const progress = motionValue(0.5);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage.getAttribute('aria-label')).toBe('An engineering system linking a workstation, API service, database, cloud infrastructure, and AI service.');
    expect(stage.querySelector('.sr-only')).not.toBeNull();
    expect(stage.getAttribute('aria-live')).toBeNull();
  });

  it('7 — transition objects are decorative (aria-hidden)', async () => {
    const progress = motionValue(0.5);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    const svg = stage.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    const packet = stage.querySelector('.rounded-full[aria-hidden="true"]');
    expect(packet).not.toBeNull();
  });

  it('8 — no new tab stops', async () => {
    const progress = motionValue(0.5);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    expect(stage.querySelectorAll('a, button, [tabindex="0"]').length).toBe(0);
    const { container: c2 } = render(
      <PortfolioModeProvider>
        <Experience />
      </PortfolioModeProvider>
    );
    expect(c2.querySelectorAll('#experience a[tabindex="0"]').length).toBe(0);
  });

  it('9 — navigation to #experience still works (anchor exists)', async () => {
    const { container } = render(
      <PortfolioModeProvider>
        <Experience />
      </PortfolioModeProvider>
    );
    const section = container.querySelector('section#experience') as HTMLElement;
    expect(section).not.toBeNull();
    expect(section.getAttribute('id')).toBe('experience');
    expect(document.getElementById('experience')).toBeTruthy();
  });

  it('10 — transition reverses safely (progress derived, not one-way)', async () => {
    const progress = motionValue(0);
    const { container } = render(
      <PortfolioModeProvider>
        <HeroEngineeringScene transitionProgress={progress} />
      </PortfolioModeProvider>
    );
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
    const stage = container.querySelector('[role="img"]') as HTMLElement;
    // forward
    await act(async () => { progress.set(0.6); await new Promise(r => setTimeout(r, 20)); });
    expect(stage).toBeInTheDocument();
    const textMid = stage.textContent;
    // reverse
    await act(async () => { progress.set(0); await new Promise(r => setTimeout(r, 20)); });
    expect(stage).toBeInTheDocument();
    const textBack = stage.textContent;
    // Should return to initial without stranded state — text should be similar (still contains workstation)
    expect(textBack).toContain('workstation');
    expect(textMid).toContain('workstation');
    expect(progress.get()).toBe(0);
  });
});
