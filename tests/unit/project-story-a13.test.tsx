import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimeSlingStory } from '../../src/components/projects/story/timesling/TimeSlingStory';
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
import storySource from '../../src/components/projects/story/timesling/TimeSlingStory.tsx?raw';

class MockIO {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
    this.callback = cb;
    this.rootMargin = opts?.rootMargin ?? '';
  }
  observe = vi.fn((el: Element) => setTimeout(() => this.callback(
    [{ target: el, isIntersecting: true, intersectionRatio: 0.7 } as IntersectionObserverEntry],
    this as unknown as IntersectionObserver
  ), 0));
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

function mockMatchMedia(reduced = false, compact = false, width = 1440) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : query.includes('pointer: coarse') ? compact : false,
    media: query,
    addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setDocumentVisible(visible: boolean) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (visible ? 'visible' : 'hidden') as DocumentVisibilityState });
}

const TIMESLING = PROJECTS.find(project => project.id === 'timesling')!;

function renderStory(options: { compact?: boolean; recruiter?: boolean; reduced?: boolean } = {}) {
  mockMatchMedia(options.reduced ?? false, options.compact ?? false, options.compact ? 375 : 1440);
  window.history.replaceState({}, '', options.recruiter ? '/?mode=recruiter' : '/');
  return render(<PortfolioModeProvider><TimeSlingStory compact={options.compact} /></PortfolioModeProvider>);
}

function stageOf(container: HTMLElement) {
  return container.querySelector('[role="img"][aria-label*="menu-bar timer utility"]');
}

async function settle(ms = 80) {
  await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
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

describe('A13 — lazy registry and canonical inventory', () => {
  it('registers TimeSling lazily while preserving the five earlier stories and unknown-id safety', () => {
    expect(registeredStoryIds()).toEqual(['ember', 'sociallens', 'incidentpilot', 'clinical-reconciliation', 'code-battlegrounds', 'timesling', 'zenco', 'nostalgia']);
    for (const id of registeredStoryIds()) expect(hasProjectStory(id), id).toBe(true);
    for (const id of ['constructor', '__proto__']) expect(hasProjectStory(id), id).toBe(false);
    expect(registrySource).toMatch(/timesling:\s*\(\)\s*=>\s*\n?\s*import\('\.\/timesling\/TimeSlingStory'\)/);
    expect(registrySource).not.toMatch(/^import\s+.*TimeSlingStory/m);
    expect(String((PROJECT_STORY_COMPONENTS.timesling as unknown as { $$typeof: symbol }).$$typeof)).toContain('lazy');
  });

  it('keeps the canonical eight-project inventory, featured set, and solo TimeSling facts unchanged', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(TIMESLING).toMatchObject({ id: 'timesling', title: 'TimeSling', contribution: 'solo', featured: false, links: { github: 'https://github.com/AruruGunabhiram/TimeSling-fresh' } });
    expect(TIMESLING.technologies).toEqual(['Swift', 'SwiftUI', 'macOS']);
  });
});

describe('A13 — product-story semantics', () => {
  it('renders one aggregate image, no controls or announcements, and five desktop concepts', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(5);
    expect([...stage.querySelectorAll('[data-story-node="primary"]')].map(node => node.getAttribute('data-node-id'))).toEqual(['create-timer', 'timer-panel', 'timer-stack', 'concurrent-timers', 'completion-notification']);
  });

  it('shows preset and custom creation, menu-bar panel, compact stacking, concurrent timers, and completion', () => {
    const { container } = renderStory({ recruiter: true });
    const stage = stageOf(container)!;
    expect(stage.textContent).toContain('Menu-bar utility');
    expect(stage.textContent).toContain('5m');
    expect(stage.textContent).toContain('15m');
    expect(stage.textContent).toContain('custom drag');
    expect(stage.textContent).toContain('TimeSling · menu-bar panel');
    expect(stage.textContent).toContain('snapped stack');
    expect(stage.textContent).toContain('Deep work');
    expect(stage.textContent).toContain('Tea');
    expect(stage.textContent).toContain('Stretch');
    expect(stage.textContent).toContain('distinct progress · 3 timers');
    expect(stage.textContent).toContain('Timer complete');
    expect(stage.textContent).toContain('fullscreen capable');
  });

  it('avoids unsupported platform, sync, analytics, and productivity-metric claims', () => {
    const { container } = renderStory({ recruiter: true });
    const rendered = `${stageOf(container)!.getAttribute('aria-label')} ${stageOf(container)!.textContent}`;
    expect(rendered).not.toMatch(/iOS|Apple Watch|cloud sync|calendar|Pomodoro|analytics|focus score|widget|App Store|hotkey|productivity metric/i);
  });

  it('uses four compact concepts without claiming the desktop utility runs on mobile', () => {
    const { container } = renderStory({ compact: true, recruiter: true });
    const stage = stageOf(container)!;
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(4);
    expect(stage.textContent).not.toMatch(/iOS|mobile app/i);
  });
});

describe('A13 — static, paused, shared-lifecycle, and fallback behavior', () => {
  it('renders the finished product state immediately for recruiter and reduced motion', () => {
    const recruiter = renderStory({ recruiter: true });
    expect(stageOf(recruiter.container)!.querySelector('[data-phase="6"]')).not.toBeNull();
    expect(recruiter.container.textContent).toContain('Static product state');
    recruiter.unmount();
    __resetStoryLifecycleForTests();
    const reduced = renderStory({ reduced: true });
    expect(stageOf(reduced.container)!.querySelector('[data-phase="6"]')).not.toBeNull();
    expect(reduced.container.textContent).toContain('Timer complete');
  });

  it('creates no timer while offscreen or document-hidden', async () => {
    vi.useFakeTimers();
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
    const offscreen = renderStory();
    await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(offscreen.container.querySelector('[data-phase="0"]')).not.toBeNull();
    expect(offscreen.container.textContent).toContain('Paused offscreen');
    expect(vi.getTimerCount()).toBe(0);
    offscreen.unmount();
    __resetStoryLifecycleForTests();
    setDocumentVisible(false);
    const hidden = renderStory();
    await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(hidden.container.querySelector('[data-phase="0"]')).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('reuses the competitive lifecycle with no local observer or alternate mode logic', () => {
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
    expect(storySource).not.toMatch(/new IntersectionObserver|useReducedMotion|usePortfolioMode/);
  });

  it('keeps the explorer card usable if the lazy chunk fails, without inventing a demo fallback', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>;
    const original = registry.timesling;
    registry.timesling = lazy(async () => { throw new Error('simulated TimeSling chunk failure'); });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = render(<PortfolioModeProvider><ProjectListItem project={TIMESLING} isExpanded={false} onToggle={() => {}} detailId="explorer-detail-timesling" /></PortfolioModeProvider>);
      await settle();
      expect(container.textContent).toContain('TimeSling');
      expect(container.textContent).toContain('macOS Productivity App');
      expect(container.querySelector('a[href="https://github.com/AruruGunabhiram/TimeSling-fresh"]')).not.toBeNull();
      expect(container.querySelector('button[aria-controls="explorer-detail-timesling"]')).not.toBeNull();
      expect(stageOf(container)).toBeNull();
    } finally {
      registry.timesling = original;
      error.mockRestore();
      warning.mockRestore();
    }
  });

  it('keeps unknown ProjectStory fallback behavior intact after TimeSling registration', () => {
    const { container } = render(<PortfolioModeProvider><ProjectStory projectId="nope" fallback={<p>safe fallback</p>} /></PortfolioModeProvider>);
    expect(container.textContent).toBe('safe fallback');
  });
});
