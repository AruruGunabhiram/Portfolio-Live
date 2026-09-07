import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { FeaturedProject } from '../../src/components/projects/FeaturedProject';
import { PROJECTS } from '../../src/data/projects';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';

/**
 * A9 — resilience: the SocialLens chunk fails to load.
 *
 * The module is mocked at the loader boundary so `import()` inside the registry
 * rejects exactly as a blocked/aborted network chunk would. The custom visual is
 * progressive enhancement only: the card must stay complete and the pre-existing
 * FlowDemo must take over.
 */
vi.mock('../../src/components/projects/story/sociallens/SocialLensStory', () => {
  throw new Error('simulated chunk load failure');
});

class MockIO {
  callback: IntersectionObserverCallback;
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
  }
  observe = vi.fn((el: Element) => {
    setTimeout(
      () =>
        this.callback(
          [{ target: el, isIntersecting: true, intersectionRatio: 0.6 } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        ),
      0
    );
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

const SOCIALLENS = PROJECTS.find(p => p.id === 'sociallens')!;

beforeEach(() => {
  __resetStoryLifecycleForTests();
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });
  window.matchMedia = vi.fn(
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList
  ) as unknown as typeof window.matchMedia;
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.clearAllMocks();
  __resetStoryLifecycleForTests();
});

describe('A9 — SocialLens story chunk failure', () => {
  it('20 — a failed story import leaves the card complete and shows the FlowDemo', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onToggle = vi.fn();

    const { container } = render(
      <PortfolioModeProvider>
        <FeaturedProject
          project={SOCIALLENS}
          index={1}
          isExpanded={false}
          onToggle={onToggle}
          detailId="featured-detail-sociallens"
        />
      </PortfolioModeProvider>
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 60));
    });

    const text = container.textContent!;
    // title, subtitle, summary, highlights, technologies survive
    expect(text).toContain('SocialLens');
    expect(text).toContain('Creator Analytics & Intelligence Platform');
    expect(text).toContain('ingests YouTube metrics');
    expect(text).toContain('Modular Spring Boot backend');
    expect(text).toContain('Java · Spring Boot · PostgreSQL · OAuth 2.0 · REST APIs');

    // links survive
    const gh = container.querySelector('a[href="https://github.com/AruruGunabhiram/SocialLens"]');
    expect(gh).not.toBeNull();

    // View details survives and still works
    const toggle = container.querySelector('button[aria-controls="featured-detail-sociallens"]')!;
    expect(toggle.textContent).toContain('View details');
    (toggle as HTMLButtonElement).click();
    expect(onToggle).toHaveBeenCalledTimes(1);

    // the existing FlowDemo took over — and the custom story is absent
    const stage = container.querySelector('[role="img"]')!;
    expect(stage).not.toBeNull();
    expect(stage.getAttribute('aria-label')).toContain('SocialLens processing flow');
    expect(text).toContain('PostgreSQL time-series store');
    expect(text).toContain('REST analytics APIs');
    expect(container.querySelector('[aria-label*="idempotent daily snapshots"]')).toBeNull();

    err.mockRestore();
    warn.mockRestore();
  });
});
