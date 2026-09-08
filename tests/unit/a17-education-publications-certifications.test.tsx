import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Education } from '../../src/sections/Education';
import { Publications } from '../../src/sections/Publications';
import { Certifications } from '../../src/sections/Certifications';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { EDUCATION } from '../../src/data/education';
import { PUBLICATIONS } from '../../src/data/publications';
import { CERTIFICATIONS } from '../../src/data/certifications';
import { PROJECTS } from '../../src/data/projects';
import { SKILLS } from '../../src/data/skills';
import { __resetStoryLifecycleForTests } from '../../src/hooks/useStoryLifecycle';

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
          [
            {
              target: el,
              isIntersecting: true,
              intersectionRatio: 1,
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

function mockMatchMedia(reduced = false) {
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reduced;
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

async function renderSections(search = '') {
  window.history.replaceState(null, '', `/${search}`);
  const utils = render(
    <PortfolioModeProvider>
      <Education />
      <Publications />
      <Certifications />
    </PortfolioModeProvider>
  );
  await act(async () => {
    await new Promise(r => setTimeout(r, 30));
  });
  return utils;
}

describe('A17 — Education / Publications / Certifications evidence visuals', () => {
  beforeEach(() => {
    // @ts-expect-error test double
    global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    mockMatchMedia(false);
    __resetStoryLifecycleForTests();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    __resetStoryLifecycleForTests();
  });

  // ── 1-3: canonical data untouched ─────────────────────────────────────────
  it('1 — EDUCATION canonical entries unchanged', () => {
    expect(EDUCATION).toHaveLength(2);
    const cu = EDUCATION.find(e => e.id === 'cu-boulder-ms');
    expect(cu).toBeDefined();
    expect(cu!.institution).toBe('University of Colorado Boulder');
    expect(cu!.degree).toBe('MS Computer Science');
    expect(cu!.period).toBe('Aug 2025 – May 2027');
    expect(cu!.gpa).toBe('3.65 / 4.0');
    const srm = EDUCATION.find(e => e.id === 'srm-bs');
    expect(srm!.institution).toBe('SRM University');
    expect(srm!.degree).toBe('BS Computer Science');
    expect(srm!.period).toBe('Aug 2021 – May 2025');
  });

  it('2 — PUBLICATIONS canonical entry unchanged', () => {
    expect(PUBLICATIONS).toHaveLength(1);
    const p = PUBLICATIONS[0];
    expect(p.id).toBe('ieee-cad-late-fusion-2025');
    expect(p.title).toBe('Computer Aided Diagnosis Multi-Model System using Late Fusion and Ensemble Learning');
    expect(p.venue).toBe('IEEE');
    expect(p.year).toBe(2025);
    expect(p.paperUrl).toBe('https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=10940411');
  });

  it('3 — CERTIFICATIONS holds exactly the one certificate-backed AWS credential', () => {
    expect(Array.isArray(CERTIFICATIONS)).toBe(true);
    expect(CERTIFICATIONS).toHaveLength(1);
    const [cert] = CERTIFICATIONS;
    expect(cert.id).toBe('aws-solutions-architect-associate');
    expect(cert.title).toBe('AWS Certified Solutions Architect - Associate');
    expect(cert.issuer).toBe('Amazon Web Services (AWS)');
    expect(cert.year).toBe(2026);
  });

  // ── 4-8: canonical facts still visible / no fabricated credential ─────────
  it('4 — MS Computer Science remains visible', async () => {
    const { container } = await renderSections();
    expect(container.textContent).toContain('MS Computer Science');
  });

  it('5 — University of Colorado Boulder remains visible', async () => {
    const { container } = await renderSections();
    expect(container.textContent).toContain('University of Colorado Boulder');
  });

  it('6 — Aug 2025 – May 2027 chronology remains, and years drive the visual rail', async () => {
    const { container } = await renderSections();
    expect(container.textContent).toContain('Aug 2025 – May 2027');
    const chrono = container.querySelector('.edu-chrono');
    expect(chrono).not.toBeNull();
    const years = Array.from(chrono!.querySelectorAll('.edu-chrono__years span')).map(n => n.textContent);
    // ascending chronology, real years only
    expect(years).toEqual(['2021', '2025', '2025', '2027']);
  });

  it('7 — the certification section mounts and renders the canonical credential', async () => {
    const { container } = await renderSections();
    expect(container.querySelector('#certifications')).not.toBeNull();
    const txt = container.textContent ?? '';
    expect(txt).toContain('AWS Certified Solutions Architect - Associate');
    expect(txt).toContain('Amazon Web Services (AWS)');
    expect(txt).toContain('2026');
    expect(txt).toContain('Issued August 30, 2026. Valid through August 30, 2029.');
    // the certificate prints no exam code, so none is claimed
    expect(txt.toLowerCase()).not.toContain('saa-c03');
  });

  it('8 — the A17 proof visual renders in the mounted section and asserts no text of its own', async () => {
    const { container } = await renderSections();
    const proof = container.querySelector('#certifications .cert-proof');
    expect(proof).not.toBeNull();
    expect(proof!.getAttribute('aria-hidden')).toBe('true');
    expect((proof!.textContent ?? '').trim()).toBe('');
    expect(container.querySelectorAll('.cert-proof__corner')).toHaveLength(4);
  });

  // ── 9-12: nothing invented ───────────────────────────────────────────────
  it('9 — no GPA invented: rendered GPA strings are exactly the canonical ones', async () => {
    const { container } = await renderSections();
    const txt = container.textContent ?? '';
    const gpaMatches = txt.match(/\d\.\d{1,2}\s*\/\s*4\.0/g) ?? [];
    const canonical = EDUCATION.map(e => e.gpa).filter(Boolean);
    gpaMatches.forEach(m => expect(canonical).toContain(m));
  });

  it('10 — no coursework, honors, thesis or research-group claims invented', async () => {
    const { container } = await renderSections();
    const txt = (container.textContent ?? '').toLowerCase();
    ['coursework', 'thesis', 'honors', 'dean’s list', 'research group', 'advisor', 'lab'].forEach(term => {
      expect(txt).not.toContain(term);
    });
  });

  it('11 — no exam score and no percentage-complete metric reaches the DOM', async () => {
    const { container } = await renderSections();
    const txt = container.textContent ?? '';
    expect(txt).not.toContain('915');
    expect(txt).not.toContain('/1000');
    expect(txt).not.toMatch(/\d+%/);
    expect(txt.toLowerCase()).not.toContain('complete');
    // including anything parked in attributes rather than text
    expect(container.innerHTML).not.toContain('915');
    expect(container.innerHTML.toLowerCase()).not.toContain('score');
  });

  it('12 — every link is canonical; no credential id and no issuer-verification claim', async () => {
    const { container } = await renderSections();
    const hrefs = Array.from(container.querySelectorAll('a')).map(a => a.getAttribute('href') ?? '');
    const canonical = [
      ...PUBLICATIONS.map(p => p.paperUrl),
      ...CERTIFICATIONS.map(c => c.credentialUrl),
      // A18: issuer-hosted verification, specific to this credential
      ...CERTIFICATIONS.map(c => c.verificationUrl),
    ].filter(Boolean);
    hrefs.forEach(h => expect(canonical).toContain(h));

    const html = container.innerHTML.toLowerCase();
    expect(html).not.toContain('credential id');
    expect(html).not.toContain('ea628dde');
    // still no score, exam code or validation number anywhere in the rendered output
    expect(html).not.toContain('915');
    expect(html).not.toContain('saa-c03');
    expect(html).not.toContain('validation number');
    // the generic AWS landing page is still never presented as verification
    expect(html).not.toContain('aws.amazon.com/verification');
    expect(html).not.toContain('verify credential');
  });

  // ── 13-14: reduced motion + recruiter ────────────────────────────────────
  it('13 — reduced motion renders the complete final state (no hidden content)', async () => {
    mockMatchMedia(true);
    __resetStoryLifecycleForTests();
    const { container } = await renderSections();
    expect(container.textContent).toContain('MS Computer Science');
    expect(container.textContent).toContain('University of Colorado Boulder');
    expect(container.textContent).toContain('Computer Aided Diagnosis Multi-Model System using Late Fusion and Ensemble Learning');
    expect(container.textContent).toContain('AWS Certified Solutions Architect - Associate');
    expect(container.querySelector('#certifications .cert-proof')).not.toBeNull();
    const chrono = container.querySelector('.edu-chrono') as HTMLElement | null;
    expect(chrono).not.toBeNull();
    // no element parked at opacity 0 waiting for an animation
    container.querySelectorAll<HTMLElement>('.edu-chrono *, .pub-doc *').forEach(el => {
      expect(el.style.opacity === '0').toBe(false);
    });
  });

  it('14 — recruiter mode is static: no sequence marker, no document visual', async () => {
    const { container } = await renderSections('?mode=recruiter');
    expect(container.querySelector('.evidence-seq')).toBeNull();
    expect(container.querySelector('.pub-doc')).toBeNull();
    expect(container.querySelector('.cert-proof')).toBeNull();
    expect(container.querySelector('.edu-chrono')).toBeNull();
    // canonical proof is still scannable
    expect(container.textContent).toContain('University of Colorado Boulder');
    expect(container.textContent).toContain('IEEE');
    expect(container.textContent).toContain('AWS Certified Solutions Architect - Associate');
    expect(container.querySelector('#certifications')).not.toBeNull();
  });

  // ── 15-17: accessibility / layout ────────────────────────────────────────
  it('15 — visuals introduce no tab stops and no interactive elements', async () => {
    const { container } = await renderSections();
    ['.edu-chrono', '.pub-doc', '.cert-proof', '.evidence-seq', '.edu-boundary'].forEach(sel => {
      container.querySelectorAll(sel).forEach(root => {
        expect(root.querySelectorAll('a, button, input, select, textarea, [tabindex]').length).toBe(0);
        expect(root.getAttribute('role')).toBeNull();
      });
    });
  });

  it('16 — no aria-live, no status role, and decorative visuals are aria-hidden', async () => {
    const { container } = await renderSections();
    expect(container.querySelectorAll('[aria-live]').length).toBe(0);
    expect(container.querySelectorAll('[role="status"], [role="alert"]').length).toBe(0);
    expect(container.querySelector('.edu-chrono')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.pub-doc')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.cert-proof')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.evidence-seq')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.edu-boundary')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('17 — section headings remain semantic and dominant', async () => {
    const { container } = await renderSections();
    const h2s = Array.from(container.querySelectorAll('h2')).map(h => h.textContent);
    expect(h2s).toContain('Education');
    expect(h2s).toContain('Publications');
    expect(h2s).toContain('Certifications');
    // institution / publication title stay h3
    const h3s = Array.from(container.querySelectorAll('h3')).map(h => h.textContent);
    expect(h3s).toContain('University of Colorado Boulder');
  });

  // ── 18-20: neighbouring systems untouched ────────────────────────────────
  it('18 — Projects data untouched by A17', () => {
    expect(PROJECTS.length).toBeGreaterThan(0);
    PROJECTS.forEach(p => {
      expect(typeof p.id).toBe('string');
      expect(typeof p.title).toBe('string');
    });
    // A17 sections must not reference the project story system
    expect(PROJECTS.some(p => p.id === 'sociallens')).toBe(true);
  });

  it('19 — A16 project hierarchy unaffected: no A17 section registers a project story', async () => {
    const registry = await import('../../src/components/story/index');
    expect(Object.keys(registry).length).toBeGreaterThan(0);
    const eduSrc = await import('../../src/sections/Education');
    expect(typeof eduSrc.Education).toBe('function');
    // the three sections render no project-story container
    const { container } = await renderSections();
    expect(container.querySelector('.project-story')).toBeNull();
  });

  it('20 — Skills data unaffected and certification evidence links stay resolvable', () => {
    expect(SKILLS.length).toBeGreaterThan(0);
    const certIds = new Set(CERTIFICATIONS.map(c => c.id));
    SKILLS.forEach(s => {
      (s.evidence ?? []).forEach(ev => {
        if (ev.type === 'certification') expect(certIds.has(ev.id)).toBe(true);
      });
    });
    // A17B left this unwired and deferred it to A18; A18 wires exactly one skill (AWS)
    // to the canonical credential. Certification evidence is now reachable from Skills.
    const certBacked = SKILLS.filter(s => (s.evidence ?? []).some(ev => ev.type === 'certification'));
    expect(certBacked.map(s => s.id)).toEqual(['aws']);
  });

  // ── 21-22: A17B certificate integration ─────────────────────────────────
  it('21 — certificate link is a real, keyboard-reachable anchor to the public artifact', async () => {
    const { container } = await renderSections();
    const link = container.querySelector<HTMLAnchorElement>('#certifications a');
    expect(link).not.toBeNull();
    expect(link!.tagName).toBe('A');
    expect(link!.textContent).toContain('View certificate');
    expect(link!.getAttribute('href')).toBe(
      '/AWS%20Certified%20Solutions%20Architect%20-%20Associate%20certificate.pdf'
    );
    expect(link!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link!.getAttribute('target')).toBe('_blank');
    expect(link!.getAttribute('aria-label')).toBe(
      'View certificate: AWS Certified Solutions Architect - Associate'
    );
    // anchors with href are natively focusable — no tabindex hack
    expect(link!.hasAttribute('tabindex')).toBe(false);
  });

  it('22 — the certificate link uses a production-safe public URL', () => {
    const url = CERTIFICATIONS[0].credentialUrl!;
    expect(url.startsWith('/')).toBe(true);
    expect(url).not.toMatch(/^\.?\/?public\//);
    expect(url).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(url).not.toContain('/Users/');
    expect(url).not.toContain(' ');
    expect(decodeURIComponent(url)).toBe(
      '/AWS Certified Solutions Architect - Associate certificate.pdf'
    );
  });
});
