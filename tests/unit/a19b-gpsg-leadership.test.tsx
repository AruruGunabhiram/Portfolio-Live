import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LEADERSHIP } from '../../src/data/leadership';
import { SKILLS } from '../../src/data/skills';
import { getPublicPortfolioSnapshot } from '../../src/data/snapshot';
import { validateSkillEvidence } from '../../src/data/validate';

describe('A19B — GPSG leadership data correction', () => {
  it('1 — canonical leadership contains exactly expected records', () => {
    expect(LEADERSHIP.length).toBe(2);
    expect(LEADERSHIP.map(l => l.id)).toEqual(['gpsg-president-outreach', 'dsa-club-srm']);
  });

  it('2 — GPSG record exists', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach');
    expect(gpsg).toBeTruthy();
  });

  it('3 — organization identifies Graduate and Professional Student Government', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    expect(gpsg.organization).toContain('Graduate and Professional Student Government');
    expect(gpsg.organization).toContain('GPSG');
  });

  it('4 — University of Colorado Boulder is present', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    expect(gpsg.organization).toContain('University of Colorado Boulder');
  });

  it('5 — role is President of Outreach', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    expect(gpsg.role).toBe('President of Outreach');
  });

  it('6 — period is Apr 2026 – Present (abbreviated)', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    expect(gpsg.period).toBe('Apr 2026 – Present');
  });

  it('7 — GPSG appears before older SRM role', () => {
    const ids = LEADERSHIP.map(l => l.id);
    expect(ids.indexOf('gpsg-president-outreach')).toBeLessThan(ids.indexOf('dsa-club-srm'));
  });

  it('8 — dsa-club-srm still exists', () => {
    const dsa = LEADERSHIP.find(l => l.id === 'dsa-club-srm');
    expect(dsa).toBeTruthy();
    expect(dsa!.organization).toBe('DSA Club — SRM University');
    expect(dsa!.role).toBe('Leader');
  });

  it('9 — existing DSA skill evidence still resolves', () => {
    const dsaSkill = SKILLS.find(s => s.id === 'dsa');
    expect(dsaSkill).toBeTruthy();
    expect(dsaSkill!.evidence).toEqual(expect.arrayContaining([{ type: 'leadership', id: 'dsa-club-srm' }]));
    const knownIds = {
      project: new Set(['ember', 'sociallens', 'incidentpilot', 'clinical-reconciliation', 'code-battlegrounds', 'timesling', 'zenco', 'nostalgia']),
      experience: new Set(['projxon-ai-intern', 'infini-ai-intern']),
      publication: new Set(['ieee-cad-late-fusion-2025']),
      certification: new Set(['aws-solutions-architect-associate']),
      leadership: new Set(LEADERSHIP.map(l => l.id)),
    };
    expect(validateSkillEvidence(SKILLS, knownIds)).toBe(true);
  });

  it('10 — no invented GPSG metrics exist', () => {
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    const blob = `${gpsg.organization} ${gpsg.role} ${gpsg.description} ${gpsg.period}`.toLowerCase();
    // must not contain quantitative/outcome claims
    const forbidden = ['students represented', 'students reached', 'budget', 'funding', '%', 'attendance', 'increase', 'growth', 'impact', 'events organized', 'outreach metrics'];
    for (const w of forbidden) {
      expect(blob).not.toContain(w);
    }
    // also ensure no digits implying headcount/budget in description
    // description may legitimately contain no numbers at all
    expect(gpsg.description).not.toMatch(/\d+\s*(students|members|events|%|budget|funding)/i);
    // ensure description is the approved restrained wording (or minimal adjustment)
    expect(gpsg.description.toLowerCase()).toContain('supports outreach');
  });

  it('11 — no election/campaign/partisan language', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/data/leadership.ts'), 'utf8').toLowerCase();
    for (const word of ['elected', 'election', 'campaign', 'vote', 'voting', 'ballot', 'partisan', 'party politics']) {
      expect(src).not.toContain(word);
    }
    const gpsg = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    const gpsgBlob = `${gpsg.organization} ${gpsg.role} ${gpsg.description}`.toLowerCase();
    for (const word of ['elected', 'campaign', 'vote', 'partisan']) {
      expect(gpsgBlob).not.toContain(word);
    }
  });

  it('12-15 — Leadership renders both entries and overflow guards (checked in a19 tests, smoke here)', async () => {
    const { render, act } = await import('@testing-library/react');
    const { Leadership } = await import('../../src/sections/Leadership');
    const { PortfolioModeProvider } = await import('../../src/context/PortfolioModeContext');
    const { ThemeProvider } = await import('../../src/context/ThemeContext');
    // mock IO
    class MockIO implements IntersectionObserver {
      callback: IntersectionObserverCallback;
      root = null; rootMargin = ''; thresholds: ReadonlyArray<number> = [];
      constructor(cb: IntersectionObserverCallback) { this.callback = cb; }
      observe = (el: Element) => setTimeout(() => this.callback([{ target: el, isIntersecting: true, intersectionRatio: 1, time: Date.now() } as IntersectionObserverEntry], this as unknown as IntersectionObserver), 0);
      unobserve = () => {}; disconnect = () => {}; takeRecords = () => [] as IntersectionObserverEntry[];
    }
    // @ts-expect-error
    global.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
    window.matchMedia = (() => ({ matches: false, media: '', addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}, onchange: null, dispatchEvent(){ return false; } })) as unknown as typeof window.matchMedia;
    const utils = render(<ThemeProvider><PortfolioModeProvider><Leadership /></PortfolioModeProvider></ThemeProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
    const text = utils.container.textContent || '';
    expect(text).toContain('Graduate and Professional Student Government');
    expect(text).toContain('President of Outreach');
    expect(text).toContain('Apr 2026');
    expect(text).toContain('DSA Club');
    // both orgs present
    expect(text).toContain('University of Colorado Boulder');
    // reduced-motion and recruiter also checked elsewhere, but ensure no overflow via fluid svg
    const leadSrc = fs.readFileSync(path.join(process.cwd(), 'src/sections/Leadership.tsx'), 'utf8');
    expect(leadSrc).toContain('LeadershipOutreachVisual');
  });

  it('leadership is exposed via getPublicPortfolioSnapshot automatically', () => {
    const snap = getPublicPortfolioSnapshot();
    expect(snap.leadership.length).toBe(2);
    expect(snap.leadership[0].id).toBe('gpsg-president-outreach');
    expect(snap.leadership[1].id).toBe('dsa-club-srm');
  });

  it('truthfulness — final production source contains no unsupported GPSG claims', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/data/leadership.ts'), 'utf8');
    // ensure description exactly matches allowed boundary (no added quantitative)
    expect(src).toContain('Supports outreach and communication');
    // fails if someone adds metric words inside leadership.ts GPSG entry
    const lines = src.split('\n').filter(l => l.includes('gpsg') || l.includes('Supports outreach'));
    expect(lines.join(' ')).not.toMatch(/\d+%/);
  });
});
