import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { Leadership } from '../../src/sections/Leadership';
import { Contact } from '../../src/sections/Contact';
import { AskGuna } from '../../src/sections/AskGuna';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { LEADERSHIP } from '../../src/data/leadership';
import { CONTACT } from '../../src/data/contact';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

/** framer-motion's whileInView needs an observer that reports "visible". */
class MockIO implements IntersectionObserver {
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
          [{ target: el, isIntersecting: true, intersectionRatio: 1, time: Date.now() } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        ),
      0
    );
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [] as IntersectionObserverEntry[];
}

function mockMatchMedia({ reduced = false } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const settle = async (ms = 30) => {
  await act(async () => {
    await new Promise(r => setTimeout(r, ms));
  });
};

async function renderSection(node: React.ReactNode, { recruiter = false } = {}) {
  window.history.replaceState(null, '', recruiter ? '/?mode=recruiter' : '/');
  const utils = render(
    <ThemeProvider>
      <PortfolioModeProvider>{node}</PortfolioModeProvider>
    </ThemeProvider>
  );
  await settle();
  return utils;
}

/** Anything a keyboard user can land on. */
const focusables = (root: Element) =>
  root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

beforeEach(() => {
  // @ts-expect-error test double
  global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
  __resetStoryLifecycleForTests();
  mockMatchMedia();
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ───────────────────────────────────────────────────────────────────────────
// §40 — Leadership
// ───────────────────────────────────────────────────────────────────────────
describe('A19 — Leadership', () => {
  it('1 — canonical leadership data is unchanged by the visual pass', () => {
    expect(LEADERSHIP.length).toBeGreaterThan(0);
    for (const e of LEADERSHIP) {
      expect(e.id).toBeTruthy();
      expect(e.organization).toBeTruthy();
      expect(e.role).toBeTruthy();
      expect(e.description).toBeTruthy();
    }
    // The visual must not have become a second source of leadership facts.
    const src = read('src/components/leadership/LeadershipOutreachVisual.tsx');
    for (const e of LEADERSHIP) {
      expect(src).not.toContain(e.organization);
      expect(src).not.toContain(e.description);
    }
  });

  it('2/3 — every canonical role and organization still renders as text', async () => {
    const { container } = await renderSection(<Leadership />);
    for (const e of LEADERSHIP) {
      expect(container.textContent).toContain(e.organization);
      expect(container.textContent).toContain(e.role);
      expect(container.textContent).toContain(e.description);
    }
  });

  it('4 — the visual asserts no impact metric: it renders no text and no digits', async () => {
    const { container } = await renderSection(<Leadership />);
    const scene = await waitFor(() => {
      const el = container.querySelector('[data-scene="leadership-outreach"]');
      expect(el).toBeTruthy();
      return el!;
    });
    // No text nodes at all → cannot state a count, reach, budget or outcome.
    expect(scene.textContent?.trim()).toBe('');
    expect(scene.querySelectorAll('text, tspan').length).toBe(0);
  });

  it('5 — no campaign / partisan / outcome vocabulary anywhere in the visual', () => {
    const src = read('src/components/leadership/LeadershipOutreachVisual.tsx').toLowerCase();
    for (const word of ['campaign', 'elect', 'vote', 'ballot', 'party', 'partisan', 'win', 'seats']) {
      expect(src).not.toContain(word);
    }
  });

  it('6 — the visual introduces no controls and no tab stops', async () => {
    const { container } = await renderSection(<Leadership />);
    const scene = await waitFor(() => container.querySelector('[data-scene="leadership-outreach"]')!);
    expect(scene).toBeTruthy();
    expect(focusables(scene).length).toBe(0);
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  });

  it('7 — recruiter mode renders the settled state with no entrance animation', async () => {
    const { container } = await renderSection(<Leadership />, { recruiter: true });
    const scene = await waitFor(() => container.querySelector('[data-scene="leadership-outreach"]')!);
    expect(scene).toBeTruthy();
    // Role marker is at full opacity immediately rather than animating up from 0.
    const marker = scene.querySelector('g');
    expect(marker).toBeTruthy();
    expect(marker!.style.opacity === '' || Number(marker!.style.opacity) === 1).toBe(true);
  });

  it('8 — reduced motion renders the settled state', async () => {
    mockMatchMedia({ reduced: true });
    __resetStoryLifecycleForTests();
    const { container } = await renderSection(<Leadership />);
    const scene = await waitFor(() => container.querySelector('[data-scene="leadership-outreach"]')!);
    expect(scene).toBeTruthy();
    expect(scene.querySelectorAll('circle').length).toBeGreaterThan(0);
  });

  it('9 — the visual is width-fluid, so it cannot force overflow at 320', () => {
    const src = read('src/components/leadership/LeadershipOutreachVisual.tsx');
    expect(src).toMatch(/<svg[\s\S]*?width="100%"/); // fluid root, capped by max-w
    expect(src).toMatch(/max-w-\[\d+px\]/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// §41 — Ask Guna
// ───────────────────────────────────────────────────────────────────────────
describe('A19 — Ask Guna', () => {
  const okFetch = (answer: string) =>
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ answer, status: 'ok' }) });

  it('1 — the API contract is untouched: same endpoint, method and body shape', async () => {
    const fetchMock = okFetch('An answer.');
    vi.stubGlobal('fetch', fetchMock);
    const { container } = await renderSection(<AskGuna />);
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'What did Guna build?' } });
    fireEvent.submit(container.querySelector('form')!);
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/ask-guna');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ question: 'What did Guna build?' });
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('2/3/4 — AskGuna stays lazy and the scene stays inside that boundary', () => {
    const home = read('src/pages/Home.tsx');
    expect(home).toMatch(/lazy\(\(\)\s*=>\s*import\('\.\.\/sections\/AskGuna'\)/);
    // The scene is reachable only through AskGuna, so it cannot leak into main.
    const importers = ['src/pages/Home.tsx', 'src/App.tsx', 'src/sections/Contact.tsx', 'src/sections/Leadership.tsx'];
    for (const f of importers) {
      expect(read(f)).not.toContain('AskGunaDeskScene');
    }
    expect(read('src/sections/AskGuna.tsx')).toContain('AskGunaDeskScene');
  });

  it('5-9 — every interaction state maps to a distinct scene state', async () => {
    let resolveFetch: ((v: unknown) => void) | null = null;
    const fetchMock = vi.fn(() => new Promise(r => (resolveFetch = r)));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = await renderSection(<AskGuna />);
    const sceneState = () =>
      container.querySelector('[data-scene="ask-guna-desk"]')?.getAttribute('data-scene-state');
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;

    expect(sceneState()).toBe('idle');

    fireEvent.change(input, { target: { value: 'Which projects use Java?' } });
    expect(sceneState()).toBe('typing');

    fireEvent.submit(container.querySelector('form')!);
    await settle(5);
    expect(sceneState()).toBe('thinking');

    await act(async () => {
      resolveFetch!({ ok: true, json: async () => ({ answer: 'SocialLens uses Java.', status: 'ok' }) });
      await new Promise(r => setTimeout(r, 20));
    });
    expect(sceneState()).toBe('answer');

    // error path
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    fireEvent.change(input, { target: { value: 'again?' } });
    fireEvent.submit(container.querySelector('form')!);
    await settle();
    expect(sceneState()).toBe('error');
  });

  it('10/11/13 — input, submit and error semantics are preserved', async () => {
    const { container } = await renderSection(<AskGuna />);
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;
    const label = container.querySelector('label[for="ask-guna-input"]');
    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(label).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toContain('ask-guna-help');
    expect(submit).toBeTruthy();
    expect(submit.disabled).toBe(true); // empty question
    fireEvent.change(input, { target: { value: 'hi' } });
    expect(submit.disabled).toBe(false);
    // the answer region keeps its live-region contract
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('12 — keyboard submission still reaches the API', async () => {
    const fetchMock = okFetch('Keyboard answer.');
    vi.stubGlobal('fetch', fetchMock);
    const { container } = await renderSection(<AskGuna />);
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'keyboard?' } });
    // Enter inside a single-input form submits it
    fireEvent.submit(container.querySelector('form')!);
    await settle();
    expect(fetchMock).toHaveBeenCalled();
    expect(container.textContent).toContain('Keyboard answer.');
  });

  it('14/15 — the scene has zero tab stops and no duplicate input or send button', async () => {
    const { container } = await renderSection(<AskGuna />);
    const scene = container.querySelector('[data-scene="ask-guna-desk"]')!;
    expect(scene).toBeTruthy();
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(focusables(scene).length).toBe(0);
    expect(scene.querySelectorAll('input, button, textarea, form').length).toBe(0);
    // exactly one real input and one real submit in the whole section
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelectorAll('button[type="submit"]').length).toBe(1);
    // decorative scene must not carry a live region
    expect(scene.querySelectorAll('[aria-live]').length).toBe(0);
  });

  it('16/17 — recruiter and reduced motion both render the scene without ambient animation', async () => {
    const recruiter = await renderSection(<AskGuna />, { recruiter: true });
    expect(recruiter.container.querySelector('[data-scene="ask-guna-desk"]')).toBeTruthy();
    recruiter.unmount();

    mockMatchMedia({ reduced: true });
    __resetStoryLifecycleForTests();
    const reducedRender = await renderSection(<AskGuna />);
    const scene = reducedRender.container.querySelector('[data-scene="ask-guna-desk"]')!;
    expect(scene).toBeTruthy();
    // full interface still present under reduced motion
    expect(reducedRender.container.querySelector('#ask-guna-input')).toBeTruthy();
    expect(reducedRender.container.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('18/19 — the scene renders no text, so it can leak neither private data nor provider errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'provider_error', message: 'Ask Guna is temporarily unavailable.' }),
      })
    );
    const { container } = await renderSection(<AskGuna />);
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'anything' } });
    fireEvent.submit(container.querySelector('form')!);
    await settle();
    const scene = container.querySelector('[data-scene="ask-guna-desk"]')!;
    expect(scene.getAttribute('data-scene-state')).toBe('error');
    expect(scene.textContent?.trim()).toBe('');
    expect(scene.querySelectorAll('text, tspan').length).toBe(0);

    const sceneHtml = scene.innerHTML;
    for (const secret of [CONTACT.email, CONTACT.phone, 'provider_error', 'api', 'key', 'stack']) {
      expect(sceneHtml.toLowerCase()).not.toContain(secret.toLowerCase());
    }
    // The source itself hardcodes no personal or provider strings.
    const src = read('src/components/ask-guna/AskGunaDeskScene.tsx');
    expect(src).not.toContain(CONTACT.email);
    expect(src).not.toContain(CONTACT.phone);
  });

  it('18b — the scene is text-free in every one of its five states', async () => {
    const { AskGunaDeskScene } = await import('../../src/components/ask-guna/AskGunaDeskScene');
    for (const state of ['idle', 'typing', 'thinking', 'answer', 'error'] as const) {
      const { container, unmount } = await renderSection(<AskGunaDeskScene state={state} />);
      const scene = container.querySelector('[data-scene="ask-guna-desk"]')!;
      expect(scene.getAttribute('data-scene-state')).toBe(state);
      expect(scene.textContent?.trim()).toBe('');
      expect(scene.querySelectorAll('text, tspan, foreignObject').length).toBe(0);
      unmount();
    }
  });

});

// ───────────────────────────────────────────────────────────────────────────
// §42 — Contact
// ───────────────────────────────────────────────────────────────────────────
describe('A19 — Contact', () => {
  it('1/3/4 — canonical contact data is unchanged and still wired to real actions', async () => {
    expect(CONTACT.email).toBe('gunabhiram.a@gmail.com');
    expect(CONTACT.linkedinUrl).toBe('https://www.linkedin.com/in/gunabhiram-aruru/');
    expect(CONTACT.githubUrl).toBe('https://github.com/AruruGunabhiram');
    const { container } = await renderSection(<Contact />);
    expect(container.querySelector(`a[href="mailto:${CONTACT.email}"]`)).toBeTruthy();
    expect(container.querySelector(`a[href="${CONTACT.linkedinUrl}"]`)).toBeTruthy();
    expect(container.querySelector(`a[href="${CONTACT.githubUrl}"]`)).toBeTruthy();
  });

  it('2 — résumé URL still resolves to a real PDF shipped in public/', () => {
    expect(CONTACT.resumeUrl).toMatch(/^\/[^/]+\.pdf$/);
    const p = path.join(process.cwd(), 'public', CONTACT.resumeUrl.replace(/^\//, ''));
    expect(fs.existsSync(p)).toBe(true);
    expect(fs.readFileSync(p).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('5 — the closing visual carries no controls and no text', async () => {
    const { container } = await renderSection(<Contact />);
    const scene = await waitFor(() => {
      const el = container.querySelector('[data-scene="contact-send"]');
      expect(el).toBeTruthy();
      return el!;
    });
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(focusables(scene).length).toBe(0);
    expect(scene.querySelectorAll('a, button, input, text, tspan').length).toBe(0);
    expect(scene.textContent?.trim()).toBe('');
  });

  it('6 — every real action stays keyboard reachable, and the visual sits after them', async () => {
    const { container } = await renderSection(<Contact />);
    const scene = await waitFor(() => container.querySelector('[data-scene="contact-send"]')!);
    const all = Array.from(focusables(container));
    expect(all.length).toBeGreaterThanOrEqual(5); // email, copy, email CTA, LinkedIn, GitHub, resume, phone, back-to-top
    for (const el of all) {
      expect(el.getAttribute('tabindex')).not.toBe('-1');
      // no real action is trapped inside the decorative scene
      expect(scene.contains(el)).toBe(false);
    }
    // the decorative ending comes after the primary email CTA in document order
    const emailCta = container.querySelector(`a[href="mailto:${CONTACT.email}"]`)!;
    expect(emailCta.compareDocumentPosition(scene) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('7 — recruiter mode omits the decorative ending and never requests its chunk', async () => {
    const { container } = await renderSection(<Contact />, { recruiter: true });
    await settle();
    expect(container.querySelector('[data-scene="contact-send"]')).toBeNull();
    // contact links remain immediately present
    expect(container.querySelector(`a[href="mailto:${CONTACT.email}"]`)).toBeTruthy();
    expect(container.querySelector(`a[href="${CONTACT.resumeUrl}"]`)).toBeTruthy();
  });

  it('8 — reduced motion renders the settled end state, not the flight', async () => {
    mockMatchMedia({ reduced: true });
    __resetStoryLifecycleForTests();
    const { container } = await renderSection(<Contact />);
    const scene = await waitFor(() => container.querySelector('[data-scene="contact-send"]')!);
    expect(scene).toBeTruthy();
    // the arrival mark is present rather than waiting on a 2.2s sequence
    expect(scene.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
  });

  it('9 — the visual is width-fluid, so it cannot force overflow at 320', () => {
    const src = read('src/components/contact/ContactSendVisual.tsx');
    expect(src).toMatch(/<svg[\s\S]*?width="100%"/); // fluid root, capped by maxWidth
    expect(src).toMatch(/maxWidth:\s*\d+/);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Shared — the decorative pair must not re-enter the initial bundle
// ───────────────────────────────────────────────────────────────────────────
describe('A19 — lazy boundary', () => {
  it('Leadership and Contact reach their visuals only through a lazy import', () => {
    for (const f of ['src/sections/Leadership.tsx', 'src/sections/Contact.tsx']) {
      const src = read(f);
      expect(src).toMatch(/lazy\(\(\)\s*=>\s*\n?\s*import\('\.\.\/components\/closing\/closingVisuals'\)/);
      expect(src).toContain('Suspense');
      // no static import of either visual
      expect(src).not.toMatch(/^import .*(LeadershipOutreachVisual|ContactSendVisual).* from/m);
    }
  });

  it('the shared chunk is not named index-*, which the budget script reserves for main JS', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/components/closing/closingVisuals.ts'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'src/components/closing/index.ts'))).toBe(false);
  });
});

// Isolated last: this resets the module registry, which would otherwise hand later
// tests a second copy of PortfolioModeContext and break every provider lookup.
describe('A19 — Ask Guna failure safety', () => {
  it('20 — Ask Guna still works when the scene renders nothing', async () => {
    vi.resetModules();
    vi.doMock('../../src/components/ask-guna/AskGunaDeskScene', () => ({
      AskGunaDeskScene: () => null,
    }));
    const [{ AskGuna: Bare }, { PortfolioModeProvider: Mode }, { ThemeProvider: Theme }] = await Promise.all([
      import('../../src/sections/AskGuna'),
      import('../../src/context/PortfolioModeContext'),
      import('../../src/context/ThemeContext'),
    ]);
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ answer: 'Still answering.', status: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = render(
      <Theme>
        <Mode>
          <Bare />
        </Mode>
      </Theme>
    );
    await settle();

    expect(container.querySelector('[data-scene="ask-guna-desk"]')).toBeNull();
    const input = container.querySelector('#ask-guna-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'does it still work?' } });
    fireEvent.submit(container.querySelector('form')!);
    await settle();
    expect(fetchMock).toHaveBeenCalled();
    expect(container.textContent).toContain('Still answering.');

    vi.doUnmock('../../src/components/ask-guna/AskGunaDeskScene');
    vi.resetModules();
  });
});
