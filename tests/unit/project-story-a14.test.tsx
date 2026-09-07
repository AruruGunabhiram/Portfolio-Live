import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectListItem } from '../../src/components/projects/ProjectListItem';
import { ProjectStory } from '../../src/components/projects/story/ProjectStory';
import { ZencoStory } from '../../src/components/projects/story/zenco/ZencoStory';
import { PROJECT_STORY_COMPONENTS, hasProjectStory, registeredStoryIds, type ProjectStoryComponentProps } from '../../src/components/projects/story/storyRegistry';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';
import registrySource from '../../src/components/projects/story/storyRegistry.ts?raw';
import storySource from '../../src/components/projects/story/zenco/ZencoStory.tsx?raw';

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
const ZENCO = PROJECTS.find(project => project.id === 'zenco')!;
function renderStory(options: { compact?: boolean; recruiter?: boolean; reduced?: boolean } = {}) {
  mockMatchMedia(options.reduced ?? false, options.compact ?? false, options.compact ? 375 : 1440);
  window.history.replaceState({}, '', options.recruiter ? '/?mode=recruiter' : '/');
  return render(<PortfolioModeProvider><ZencoStory compact={options.compact} /></PortfolioModeProvider>);
}
function stageOf(container: HTMLElement) { return container.querySelector('[role="img"][aria-label*="collaborative developer-tooling workflow"]'); }

beforeEach(() => { __resetStoryLifecycleForTests(); (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO; mockMatchMedia(); setDocumentVisible(true); window.history.replaceState({}, '', '/'); });
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); __resetStoryLifecycleForTests(); setDocumentVisible(true); });

describe('A14 — Zenco lazy registry and canonical boundaries', () => {
  it('registers only Zenco lazily, preserves six earlier stories, and keeps unknown IDs safe', () => {
    expect(registeredStoryIds()).toEqual(['ember', 'sociallens', 'incidentpilot', 'clinical-reconciliation', 'code-battlegrounds', 'timesling', 'zenco']);
    for (const id of registeredStoryIds()) expect(hasProjectStory(id), id).toBe(true);
    for (const id of ['nostalgia', 'constructor', '__proto__']) expect(hasProjectStory(id), id).toBe(false);
    expect(registrySource).toMatch(/zenco:\s*\(\)\s*=>\s*import\('\.\/zenco\/ZencoStory'\)/);
    expect(registrySource).not.toMatch(/^import\s+.*ZencoStory/m);
    expect(String((PROJECT_STORY_COMPONENTS.zenco as unknown as { $$typeof: symbol }).$$typeof)).toContain('lazy');
  });

  it('keeps canonical data, inventory, featured projects, and co-built attribution unchanged', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(PROJECTS.filter(project => project.featured).map(project => project.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
    expect(ZENCO).toMatchObject({ id: 'zenco', contribution: 'co-built', links: { github: 'https://github.com/paudelnirajan/zenco-vscode-extension' } });
    expect(ZENCO.technologies).toEqual(['Python', 'TypeScript', 'OOP', 'Design Patterns', 'VS Code API']);
  });
});

describe('A14 — Zenco integration story', () => {
  it('shows one passive aggregate image with five desktop concepts and the verified integration bridge', () => {
    const { container } = renderStory({ recruiter: true }); const stage = stageOf(container)!;
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(stage.querySelectorAll('button, a, input, select, textarea, [tabindex]')).toHaveLength(0);
    expect(stage.querySelectorAll('[aria-live], [role="status"], [role="alert"]')).toHaveLength(0);
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(5);
    expect(stage.textContent).toContain('Editor workspace'); expect(stage.textContent).toContain('VS Code extension');
    expect(stage.textContent).toContain('VS Code API'); expect(stage.textContent).toContain('Stable interface');
    expect(stage.textContent).toContain('Python CLI engine'); expect(stage.textContent).toContain('request ↔ response');
    expect(stage.textContent).toContain('insight returned to workflow');
  });

  it('uses four compact concepts while keeping the interface as a connector label', () => {
    const { container } = renderStory({ compact: true, recruiter: true }); const stage = stageOf(container)!;
    expect(stage.querySelectorAll('[data-story-node="primary"]')).toHaveLength(4);
    expect(stage.textContent).toContain('Stable interface · response returned');
  });

  it('does not claim sole engine ownership, patterns authorship, autonomous edits, AI, or cloud execution', () => {
    const { container } = renderStory({ recruiter: true });
    const rendered = `${stageOf(container)!.getAttribute('aria-label')} ${stageOf(container)!.textContent}`;
    expect(rendered).not.toMatch(/I built|my engine|I designed|Strategy|Factory|autonomous|automatically|AI |cloud|remote service|production-scale/i);
  });
});

describe('A14 — shared lifecycle and failure safety', () => {
  it('immediately renders the completed static state for recruiter and reduced motion', () => {
    const recruiter = renderStory({ recruiter: true }); expect(stageOf(recruiter.container)!.querySelector('[data-phase="5"]')).not.toBeNull(); expect(recruiter.container.textContent).toContain('Static workflow'); recruiter.unmount();
    __resetStoryLifecycleForTests(); const reduced = renderStory({ reduced: true }); expect(stageOf(reduced.container)!.querySelector('[data-phase="5"]')).not.toBeNull(); expect(reduced.container.textContent).toContain('RETURNED');
  });

  it('creates no timer while offscreen or document-hidden', async () => {
    vi.useFakeTimers(); (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = OffscreenIO;
    const offscreen = renderStory(); await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(offscreen.container.querySelector('[data-phase="0"]')).not.toBeNull(); expect(vi.getTimerCount()).toBe(0); offscreen.unmount();
    __resetStoryLifecycleForTests(); setDocumentVisible(false); const hidden = renderStory(); await act(async () => { await vi.advanceTimersByTimeAsync(9000); });
    expect(hidden.container.querySelector('[data-phase="0"]')).not.toBeNull(); expect(vi.getTimerCount()).toBe(0);
  });

  it('reuses the competitive lifecycle without a local observer or alternate motion logic', () => {
    expect(storySource).toMatch(/useStoryLifecycle\(ref,\s*\{\s*competitive:\s*true\s*\}\)/);
    expect(storySource).not.toMatch(/new IntersectionObserver|useReducedMotion|usePortfolioMode/);
  });

  it('keeps the explorer card, details, and repository usable when the lazy chunk fails', async () => {
    const registry = PROJECT_STORY_COMPONENTS as unknown as Record<string, LazyExoticComponent<ComponentType<ProjectStoryComponentProps>>>;
    const original = registry.zenco; registry.zenco = lazy(async () => { throw new Error('simulated Zenco chunk failure'); });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {}); const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { container } = render(<PortfolioModeProvider><ProjectListItem project={ZENCO} isExpanded={false} onToggle={() => {}} detailId="explorer-detail-zenco" /></PortfolioModeProvider>);
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 80)); });
      expect(container.textContent).toContain('Zenco'); expect(container.textContent).toContain('Modular Developer Tooling System');
      expect(container.querySelector('a[href="https://github.com/paudelnirajan/zenco-vscode-extension"]')).not.toBeNull();
      expect(container.querySelector('button[aria-controls="explorer-detail-zenco"]')).not.toBeNull(); expect(stageOf(container)).toBeNull();
    } finally { registry.zenco = original; error.mockRestore(); warning.mockRestore(); }
  });

  it('keeps unknown ProjectStory fallback behavior intact after Zenco registration', () => {
    const { container } = render(<PortfolioModeProvider><ProjectStory projectId="nostalgia" fallback={<p>safe fallback</p>} /></PortfolioModeProvider>);
    expect(container.textContent).toBe('safe fallback');
  });
});
