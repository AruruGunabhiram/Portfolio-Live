import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectListItem } from '../../src/components/projects/ProjectListItem';
import { ProjectStory } from '../../src/components/projects/story/ProjectStory';
import { NostalgiaStory } from '../../src/components/projects/story/nostalgia/NostalgiaStory';
import { PROJECT_STORY_COMPONENTS, hasProjectStory, registeredStoryIds, type ProjectStoryComponentProps } from '../../src/components/projects/story/storyRegistry';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';
import storySource from '../../src/components/projects/story/nostalgia/NostalgiaStory.tsx?raw';

class MockIO {
  root = null; rootMargin = ''; thresholds: ReadonlyArray<number> = [];
  constructor(private callback: IntersectionObserverCallback, opts?: IntersectionObserverInit) { this.rootMargin = opts?.rootMargin ?? ''; }
  observe = vi.fn((el: Element) => setTimeout(() => this.callback([{ target: el, isIntersecting: true, intersectionRatio: 0.7 } as IntersectionObserverEntry], this as unknown as IntersectionObserver), 0));
  unobserve = vi.fn(); disconnect = vi.fn(); takeRecords = () => [] as IntersectionObserverEntry[];
}
class OffscreenIO {
  root = null; rootMargin = ''; thresholds: ReadonlyArray<number> = [];
  constructor(_callback: IntersectionObserverCallback) {} observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); takeRecords = () => [] as IntersectionObserverEntry[];
}
function mockMatchMedia(reduced = false, compact = false, width = 1440) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  window.matchMedia = vi.fn((query: string) => ({ matches: query.includes('prefers-reduced-motion') ? reduced : query.includes('pointer: coarse') ? compact : false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn() })) as unknown as typeof window.matchMedia;
}
function setDocumentVisible(visible: boolean) { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (visible ? 'visible' : 'hidden') as DocumentVisibilityState }); }
const NOSTALGIA = PROJECTS.find(project => project.id === 'nostalgia')!;
function renderStory(options: { compact?: boolean; recruiter?: boolean; reduced?: boolean } = {}) {
  mockMatchMedia(options.reduced ?? false, options.compact ?? false, options.compact ? 375 : 1440);
  window.history.replaceState({}, '', options.recruiter ? '/?mode=recruiter' : '/');
  return render(<PortfolioModeProvider><NostalgiaStory compact={options.compact} /></PortfolioModeProvider>);
}
function stageOf(container: HTMLElement) { return container.querySelector('[role="img"][aria-label*="browser extension workflow"]'); }

beforeEach(() => { __resetStoryLifecycleForTests(); (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO; mockMatchMedia(); setDocumentVisible(true); window.history.replaceState({}, '', '/'); });
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); __resetStoryLifecycleForTests(); setDocumentVisible(true); });

describe('A15 — Nostalgia registry and canonical boundaries', () => {
  it('registers Nostalgia lazily, preserves the seven earlier loaders, and keeps unknown IDs safe', () => {
    expect(registeredStoryIds()).toEqual(['ember', 'sociallens', 'incidentpilot', 'clinical-reconciliation', 'code-battlegrounds', 'timesling', 'zenco', 'nostalgia']);
    for (const id of registeredStoryIds()) expect(hasProjectStory(id), id).toBe(true);
    for (const id of ['nope', 'constructor', '__proto__']) expect(hasProjectStory(id), id).toBe(false);
    expect(registrySource).toMatch(/nostalgia:\s*\(\)\s*=>\s*import\('\.\/nostalgia\/NostalgiaStory'\)/);
    expect(registrySource).not.toMatch(/^import\s+.*NostalgiaStory/m);
    expect(String((PROJECT_STORY_COMPONENTS.nostalgia as unknown as { $$typeof: symbol }).$$typeof)).toContain('lazy');
  });

  it('keeps canonical inventory, featured set, and co-built attribution intact', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(NOSTALGIA).toMatchObject({ id: 'nostalgia', contribution: 'co-built', links: { github: 'https://github.com/Meghan31/nostalgia-copy-paste-extension' } });
    expect(NOSTALGIA.technologies).toEqual(['React', 'TypeScript', 'SCSS', 'Chrome Extension APIs']);
  });
});

describe('A15 — Nostalgia capture, local save, and reuse story', () => {
  it('shows exactly one passive aggregate with four desktop concepts and only synthetic snippet text', () => {
    const { container } = renderStory({ recruiter: true }); const stage = stageOf(container)!;
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(4);
    for (const text of ['Reusable text snippet', 'Nostalgia extension', 'Saved snippets', 'LOCAL STORAGE', 'stored locally in browser', 'Reuse snippet', 'ready to paste']) expect(stage.textContent).toContain(text);
    const rendered = `${stage.getAttribute('aria-label')} ${stage.textContent}`;
    expect(rendered).not.toMatch(/password|token|@[a-z0-9.-]+\.[a-z]{2,}|https?:\/\/|cloud|sync|account|login|AI |categor|semantic|search|Chrome Web Store|productivity|\d+%/i);
  });

  it('uses three compact concepts by merging source and extension capture', () => {
    const { container } = renderStory({ compact: true, recruiter: true }); const stage = stageOf(container)!;
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(3);
    expect(stage.textContent).toContain('Capture copied text · extension');
  });

  it('immediately renders captured, saved, and reusable static meaning for recruiter and reduced motion', () => {
    const recruiter = renderStory({ recruiter: true }); expect(stageOf(recruiter.container)!.querySelector('[data-phase="4"]')).not.toBeNull(); expect(recruiter.container.textContent).toContain('Static workflow'); recruiter.unmount();
    __resetStoryLifecycleForTests(); const reduced = renderStory({ reduced: true }); expect(stageOf(reduced.container)!.querySelector('[data-phase="4"]')).not.toBeNull(); expect(reduced.container.textContent).toContain('READY');
  });

  it('creates no timer while offscreen or document-hidden and reuses the competitive lifecycle', async () => {
    vi.useFakeTimers(); (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
    const offscreen = renderStory(); await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(offscreen.container.querySelector('[data-phase="0"]')).not.toBeNull(); expect(vi.getTimerCount()).toBe(0); offscreen.unmount();
    __resetStoryLifecycleForTests(); setDocumentVisible(false); const hidden = renderStory(); await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(hidden.container.querySelector('[data-phase="0"]')).not.toBeNull(); expect(vi.getTimerCount()).toBe(0);
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
    expect(storySource).not.toMatch(/new IntersectionObserver|useReducedMotion|usePortfolioMode/);
  });

  it('keeps the explorer card, details, and repository usable when the lazy chunk fails', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>;
    const original = registry.nostalgia; registry.nostalgia = lazy(async () => { throw new Error('simulated Nostalgia chunk failure'); });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {}); const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = render(<PortfolioModeProvider><ProjectListItem project={NOSTALGIA} isExpanded={false} onToggle={() => {}} detailId="explorer-detail-nostalgia" /></PortfolioModeProvider>);
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 80)); });
      expect(container.textContent).toContain('Nostalgia'); expect(container.textContent).toContain('Browser Extension / Productivity Tool');
      expect(container.querySelector('a[href="https://github.com/Meghan31/nostalgia-copy-paste-extension"]')).not.toBeNull();
      expect(container.querySelector('button[aria-controls="explorer-detail-nostalgia"]')).not.toBeNull(); expect(stageOf(container)).toBeNull();
    } finally { registry.nostalgia = original; error.mockRestore(); warning.mockRestore(); }
  });

  it('keeps unknown ProjectStory fallback behavior intact after Nostalgia registration', () => {
    const { container } = render(<PortfolioModeProvider><ProjectStory projectId="nope" fallback={<p>safe fallback</p>} /></PortfolioModeProvider>);
    expect(container.textContent).toBe('safe fallback');
  });
});
