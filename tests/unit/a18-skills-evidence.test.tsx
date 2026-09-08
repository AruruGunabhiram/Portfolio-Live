import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { Skills } from '../../src/sections/Skills';
import { PortfolioModeProvider } from '../../src/context/PortfolioModeContext';
import { SKILLS, SKILL_CATEGORIES } from '../../src/data/skills';
import { PROJECTS } from '../../src/data/projects';
import { EXPERIENCE } from '../../src/data/experience';
import { PUBLICATIONS } from '../../src/data/publications';
import { CERTIFICATIONS } from '../../src/data/certifications';
import { LEADERSHIP } from '../../src/data/leadership';
import {
  resolveSkillEvidence,
  resolveSkillEvidenceList,
  evidenceCountLabel,
} from '../../src/utils/skillEvidence';

const CANONICAL_CATEGORY_ORDER = [
  'languages',
  'backend',
  'frontend',
  'databases',
  'ai',
  'design',
  'devops',
];

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

/**
 * `rail` drives the `(min-width: 1024px)` query: true renders the desktop evidence
 * rail, false renders the mobile inline panel. `reduced` drives reduced motion.
 */
function mockMatchMedia({ rail = true, reduced = false } = {}) {
  window.matchMedia = vi.fn((query: string) => {
    let matches = false;
    if (query.includes('prefers-reduced-motion')) matches = reduced;
    if (query.includes('min-width: 1024px')) matches = rail;
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

async function renderSkills(search = '') {
  window.history.replaceState(null, '', `/${search}`);
  const utils = render(
    <PortfolioModeProvider>
      <Skills />
    </PortfolioModeProvider>
  );
  await act(async () => {
    await new Promise(r => setTimeout(r, 20));
  });
  return utils;
}

const skillButton = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll('button')).find(
    b => b.textContent?.trim() === name
  ) as HTMLButtonElement | undefined;

describe('A18 — Skills / evidence linking', () => {
  beforeEach(() => {
    // @ts-expect-error test double
    global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    mockMatchMedia();
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => vi.restoreAllMocks());

  // ── 1-2: canonical data is untouched by presentation work ────────────────
  it('1 — canonical skill count and ids unchanged', () => {
    expect(SKILLS).toHaveLength(37);
    expect(new Set(SKILLS.map(s => s.id)).size).toBe(37);
  });

  it('2 — category order unchanged', () => {
    expect(SKILL_CATEGORIES.map(c => c.id)).toEqual(CANONICAL_CATEGORY_ORDER);
  });

  // ── 3-7: one resolver, every source type ─────────────────────────────────
  it('3 — resolves project evidence from canonical PROJECTS', () => {
    const p = PROJECTS[0];
    const r = resolveSkillEvidence({ type: 'project', id: p.id });
    expect(r).toEqual({ type: 'project', label: p.title, typeLabel: 'Project', href: '#projects' });
  });

  it('4 — resolves experience evidence from canonical EXPERIENCE', () => {
    const e = EXPERIENCE.find(x => x.id === 'infini-ai-intern')!;
    const r = resolveSkillEvidence({ type: 'experience', id: e.id })!;
    expect(r.label).toBe(e.companyShort ?? e.company);
    expect(r.typeLabel).toBe('Experience');
    expect(r.href).toBe('#experience');
  });

  it('5 — resolves publication evidence from canonical PUBLICATIONS', () => {
    const pub = PUBLICATIONS[0];
    const r = resolveSkillEvidence({ type: 'publication', id: pub.id })!;
    expect(r.label).toBe(`${pub.venue} · ${pub.year}`);
    expect(r.typeLabel).toBe('Publication');
    expect(r.href).toBe('#publications');
  });

  it('6 — resolves certification evidence from canonical CERTIFICATIONS', () => {
    const c = CERTIFICATIONS[0];
    const r = resolveSkillEvidence({ type: 'certification', id: c.id })!;
    expect(r.label).toBe(c.title);
    expect(r.typeLabel).toBe('Certification');
    expect(r.href).toBe('#certifications');
  });

  it('6b — resolves leadership evidence (the fifth canonical source type)', () => {
    const l = LEADERSHIP[0];
    const r = resolveSkillEvidence({ type: 'leadership', id: l.id })!;
    expect(r.label).toBe(l.organization);
    expect(r.typeLabel).toBe('Leadership');
    expect(r.href).toBe('#leadership');
  });

  it('7 — the AWS skill resolves to the canonical AWS certification', () => {
    const aws = SKILLS.find(s => s.id === 'aws')!;
    const resolved = resolveSkillEvidenceList(aws);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].typeLabel).toBe('Certification');
    expect(resolved[0].label).toBe('AWS Certified Solutions Architect - Associate');
    expect(resolved[0].href).toBe('#certifications');
  });

  // ── 8-9: nothing unsupported leaks through Skills ─────────────────────────
  it('8-9 — no score, validation number or exam code in rendered Skills', async () => {
    const { container } = await renderSkills();
    const aws = skillButton(container, 'AWS')!;
    fireEvent.click(aws);
    const html = container.innerHTML;
    expect(html).not.toContain('915');
    expect(html).not.toContain('/1000');
    expect(html).not.toContain('SAA-C03');
    expect(html.toLowerCase()).not.toContain('validation');
  });

  // ── 10-11: honesty about absent evidence ─────────────────────────────────
  it('10 — a zero-evidence skill renders honestly rather than looking broken', async () => {
    const { container } = await renderSkills();
    const git = skillButton(container, 'Git')!;
    fireEvent.click(git);
    const panel = container.querySelector('#skills-evidence')!;
    expect(panel.textContent).toContain('No linked portfolio evidence yet');
    expect(panel.querySelectorAll('.skill-evidence__row')).toHaveLength(0);
  });

  it('11 — design-patterns still has no fabricated evidence (A7B truthfulness guard)', () => {
    const dp = SKILLS.find(s => s.id === 'design-patterns')!;
    expect(dp.evidence ?? []).toHaveLength(0);
    expect(resolveSkillEvidenceList(dp)).toHaveLength(0);
    // specifically: no Zenco link invented to make the row look complete
    expect(JSON.stringify(dp)).not.toContain('zenco');
  });

  // ── 12-14: integrity of every rendered evidence row ──────────────────────
  it('12 — no dangling evidence reference anywhere in canonical data', () => {
    const ids = {
      project: new Set(PROJECTS.map(p => p.id)),
      experience: new Set(EXPERIENCE.map(e => e.id)),
      publication: new Set(PUBLICATIONS.map(p => p.id)),
      certification: new Set(CERTIFICATIONS.map(c => c.id)),
      leadership: new Set(LEADERSHIP.map(l => l.id)),
    };
    for (const s of SKILLS) {
      for (const ev of s.evidence ?? []) {
        expect(ids[ev.type].has(ev.id), `${s.id} → ${ev.type}:${ev.id}`).toBe(true);
        expect(resolveSkillEvidence(ev)).not.toBeNull();
      }
    }
  });

  it('13 — every evidence label is derived from a canonical source record', () => {
    const allowed = new Set<string>([
      ...PROJECTS.map(p => p.title),
      ...EXPERIENCE.map(e => e.companyShort ?? e.company),
      ...PUBLICATIONS.map(p => `${p.venue} · ${p.year}`),
      ...CERTIFICATIONS.map(c => c.title),
      ...LEADERSHIP.map(l => l.organization),
    ]);
    for (const s of SKILLS) {
      for (const r of resolveSkillEvidenceList(s)) expect(allowed.has(r.label)).toBe(true);
    }
  });

  it('14 — evidence links use real in-page section hrefs only', async () => {
    const valid = new Set(['#projects', '#experience', '#publications', '#certifications', '#leadership']);
    for (const s of SKILLS) {
      for (const r of resolveSkillEvidenceList(s)) expect(valid.has(r.href)).toBe(true);
    }
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'Python')!);
    const links = Array.from(container.querySelectorAll('#skills-evidence a'));
    expect(links.length).toBeGreaterThan(0);
    links.forEach(a => expect(valid.has(a.getAttribute('href')!)).toBe(true));
  });

  // ── 15-19: accessibility ─────────────────────────────────────────────────
  it('15 — skills are real buttons, not clickable divs, and are keyboard reachable', async () => {
    const { container } = await renderSkills();
    const buttons = Array.from(container.querySelectorAll('#skills button'));
    expect(buttons).toHaveLength(SKILLS.length);
    buttons.forEach(b => {
      expect(b.tagName).toBe('BUTTON');
      expect(b.getAttribute('type')).toBe('button');
      expect(b.hasAttribute('disabled')).toBe(false);
      // native buttons are focusable and fire on Enter/Space without extra handlers
      expect(b.getAttribute('tabindex')).toBeNull();
    });
    expect(container.querySelectorAll('[onclick]')).toHaveLength(0);
  });

  it('16 — aria-expanded tracks selection and aria-controls points at the live panel', async () => {
    const { container } = await renderSkills();
    const python = skillButton(container, 'Python')!;
    expect(python.getAttribute('aria-expanded')).toBe('false');
    expect(python.getAttribute('aria-controls')).toBe('skills-evidence');

    fireEvent.click(python);
    expect(python.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('#skills-evidence')).not.toBeNull();

    // re-activating collapses again
    fireEvent.click(python);
    expect(python.getAttribute('aria-expanded')).toBe('false');
  });

  it('17 — evidence is reachable by click alone; nothing essential is hover-only', async () => {
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'Python')!);
    const panel = container.querySelector('#skills-evidence')!;
    // no pointer events were dispatched — the content is present after a plain click
    expect(panel.textContent).toContain('Ember');
    expect(panel.textContent).toContain('IncidentPilot');
    const src = Skills.toString();
    expect(src).not.toContain('onMouseEnter');
    expect(src).not.toContain('onMouseOver');
  });

  it('18 — exactly one evidence panel exists, so links are never duplicate tab stops', async () => {
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'Python')!);
    expect(container.querySelectorAll('#skills-evidence')).toHaveLength(1);
    const labels = Array.from(container.querySelectorAll('#skills-evidence a')).map(
      a => a.getAttribute('aria-label')
    );
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('19 — each skill button carries an accessible name including its evidence count', async () => {
    const { container } = await renderSkills();
    expect(skillButton(container, 'Python')!.getAttribute('aria-label')).toBe(
      'Python — 4 linked sources'
    );
    expect(skillButton(container, 'AWS')!.getAttribute('aria-label')).toBe(
      'AWS — 1 linked source'
    );
    expect(skillButton(container, 'Git')!.getAttribute('aria-label')).toBe(
      'Git — No linked portfolio evidence yet'
    );
  });

  // ── 20-22: modes and viewports ───────────────────────────────────────────
  it('20 — recruiter mode shows evidence without interaction and without scores', async () => {
    const { container } = await renderSkills('?mode=recruiter');
    const text = container.textContent ?? '';
    expect(text).toContain('Python');
    expect(text).toContain('Ember');
    expect(text).not.toMatch(/\d+%/);
    expect(text).not.toMatch(/\b(Expert|Advanced|Intermediate|Beginner)\b/);
  });

  it('21 — reduced motion keeps the interaction and the full evidence content', async () => {
    mockMatchMedia({ reduced: true });
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'Python')!);
    const panel = container.querySelector('#skills-evidence')!;
    expect(panel.textContent).toContain('4 linked sources');
    expect(panel.querySelectorAll('.skill-evidence__row')).toHaveLength(4);
  });

  it('22 — below the rail breakpoint the panel is inline and only one skill expands', async () => {
    mockMatchMedia({ rail: false });
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'Python')!);
    let panels = container.querySelectorAll('#skills-evidence');
    expect(panels).toHaveLength(1);
    // the inline panel sits inside the selected skill's own category group — the
    // nearest ancestor carrying a category heading is Languages, not a later group
    let group: HTMLElement | null = panels[0].parentElement;
    while (group && !group.querySelector('h3')) group = group.parentElement;
    expect(group).not.toBeNull();
    expect(group!.querySelector('h3')!.textContent).toBe('Languages');
    expect(group!.textContent).not.toContain('Backend & Systems');

    fireEvent.click(skillButton(container, 'AWS')!);
    panels = container.querySelectorAll('#skills-evidence');
    expect(panels).toHaveLength(1);
    expect(panels[0].textContent).toContain('AWS Certified Solutions Architect - Associate');
    expect(skillButton(container, 'Python')!.getAttribute('aria-expanded')).toBe('false');
  });

  // ── 24: attribution safety ───────────────────────────────────────────────
  it('24 — co-built projects are named neutrally, with no ownership claim from Skills', async () => {
    const { container } = await renderSkills();
    fireEvent.click(skillButton(container, 'TypeScript')!);
    const panel = container.querySelector('#skills-evidence')!;
    const text = panel.textContent ?? '';
    expect(text).toContain('Zenco');
    expect(text).not.toMatch(/Built in/i);
    expect(text).not.toMatch(/\bI built\b/i);
    expect(text).not.toMatch(/\bmy project\b/i);
    // the row is just the canonical title plus a quiet type label
    const row = Array.from(panel.querySelectorAll('.skill-evidence__row')).find(r =>
      r.textContent?.includes('Zenco')
    )!;
    expect(row.textContent).toBe('ZencoProject');
  });

  // ── 25-26: neighbouring sections untouched ───────────────────────────────
  it('25-26 — Skills renders no proficiency scoring of any kind', async () => {
    const { container } = await renderSkills();
    for (const s of SKILLS) {
      const b = skillButton(container, s.name);
      if (b) fireEvent.click(b);
    }
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text).not.toMatch(/\b(proficiency|expert|advanced|intermediate|years of experience)\b/i);
    expect(text).not.toMatch(/\b(verified|proven|certified)\s+skill\b/i);
  });

  // ── count phrasing ───────────────────────────────────────────────────────
  it('27 — evidence counts are neutral and correctly pluralised', () => {
    expect(evidenceCountLabel(0)).toBe('No linked portfolio evidence yet');
    expect(evidenceCountLabel(1)).toBe('1 linked source');
    expect(evidenceCountLabel(4)).toBe('4 linked sources');
    expect(evidenceCountLabel(2)).not.toMatch(/verified|proven|certified/i);
  });

  it('28 — evidence keeps canonical array order (no invented ranking)', () => {
    const python = SKILLS.find(s => s.id === 'python')!;
    expect(resolveSkillEvidenceList(python).map(r => r.typeLabel)).toEqual([
      'Experience',
      'Project',
      'Project',
      'Project',
    ]);
  });
});
