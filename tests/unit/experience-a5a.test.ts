import { describe, it, expect } from 'vitest';
import { EXPERIENCE } from '../../src/data/experience';
import { getPublicPortfolioSnapshot } from '../../src/data/snapshot';
import { SKILLS } from '../../src/data/skills';
import { PROJECTS } from '../../src/data/projects';
import { PUBLICATIONS } from '../../src/data/publications';
import { LEADERSHIP } from '../../src/data/leadership';
import { CERTIFICATIONS } from '../../src/data/certifications';

describe('A5A — Experience content reconciliation', () => {
  it('1 — exactly two Experience records exist', () => {
    expect(EXPERIENCE.length).toBe(2);
    expect(EXPERIENCE.map(e => e.id).sort()).toEqual(['infini-ai-intern', 'projxon-ai-intern'].sort());
  });

  it('2 — PROJXON is ordered first/current', () => {
    expect(EXPERIENCE[0].id).toBe('projxon-ai-intern');
    expect(EXPERIENCE[0].company).toBe('PROJXON');
    expect(EXPERIENCE[0].role).toBe('AI Intern');
    // current indicator: period contains Present or is first
    expect(EXPERIENCE[0].period.toLowerCase()).toContain('present');
  });

  it('3 — InfiniAI remains present unchanged', () => {
    const infini = EXPERIENCE.find(e => e.id === 'infini-ai-intern');
    expect(infini).toBeTruthy();
    expect(infini?.company).toBe('InfiniAI Technologies Pvt. Ltd.');
    expect(infini?.companyShort).toBe('InfiniAI Technologies');
    expect(infini?.role).toBe('Software Engineer Intern');
    expect(infini?.location).toBe('Hyderabad, India');
    expect(infini?.period).toBe('Sep 2024 – Nov 2024');
    expect(infini?.technologies).toEqual(['Python', 'Flask']);
    expect(infini?.bullets.length).toBe(4);
  });

  it('4 — IDs are unique', () => {
    const ids = EXPERIENCE.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('5 — required Experience schema fields remain valid', () => {
    for (const exp of EXPERIENCE) {
      expect(exp.id).toBeTruthy();
      expect(typeof exp.id).toBe('string');
      expect(exp.company).toBeTruthy();
      expect(typeof exp.company).toBe('string');
      expect(exp.role).toBeTruthy();
      expect(typeof exp.role).toBe('string');
      expect(exp.location).toBeTruthy();
      expect(typeof exp.location).toBe('string');
      expect(exp.period).toBeTruthy();
      expect(typeof exp.period).toBe('string');
      expect(Array.isArray(exp.bullets)).toBe(true);
      expect(exp.bullets.length).toBeGreaterThan(0);
      for (const b of exp.bullets) {
        expect(typeof b).toBe('string');
        expect(b.length).toBeGreaterThan(10);
      }
      if (exp.technologies) {
        expect(Array.isArray(exp.technologies)).toBe(true);
      }
    }
  });

  it('6 — Hero proof remains valid (EXPERIENCE[0] has required display fields)', () => {
    const exp = EXPERIENCE[0];
    // Hero uses role, company/companyShort, period, location
    expect(exp.role).toBeTruthy();
    expect(exp.company).toBeTruthy();
    expect(exp.period).toBeTruthy();
    expect(exp.location).toBeTruthy();
    // HeroProofRow renders role + companyShort
    const displayCompany = exp.companyShort ?? exp.company;
    expect(displayCompany).toBe('PROJXON');
    // Ensure Hero proof not awkward: role + company should be concise
    expect(`${exp.role} · ${displayCompany}`.length).toBeLessThan(60);
  });

  it('7 — Ask Guna snapshot contains only portfolio-safe PROJXON information', () => {
    const snap = getPublicPortfolioSnapshot();
    expect(snap.experience.length).toBe(2);
    const projxon = snap.experience.find(e => e.id === 'projxon-ai-intern');
    expect(projxon).toBeTruthy();
    expect(projxon?.company).toBe('PROJXON');
    expect(projxon?.role).toBe('AI Intern');
    // snapshot should be same object as canonical (no extra private fields)
    expect(JSON.stringify(projxon)).not.toContain('CPT');
    expect(JSON.stringify(snap)).not.toContain('visa');
  });

  it('8 — no private CPT/visa/payment information appears in public snapshot', () => {
    const snap = getPublicPortfolioSnapshot();
    // A17C: `certifications` legitimately carries a public `credentialUrl` (a link to the
    // certificate PDF already published in public/). It is scanned separately below with
    // the same forbidden list minus that one field name, so the guard is not weakened for
    // any other snapshot class.
    const { certifications, ...rest } = snap;
    const json = JSON.stringify(rest).toLowerCase();
    const forbidden = ['cpt', 'visa', 'compensation', 'salary', 'payment', 'payroll', 'secret', 'credential', 'api_key', 'gsk_'];
    for (const term of forbidden) {
      expect(json, `snapshot should not contain private term: ${term}`).not.toContain(term);
    }

    const certJson = JSON.stringify(certifications).toLowerCase();
    for (const term of forbidden.filter(t => t !== 'credential')) {
      expect(certJson, `certifications should not contain private term: ${term}`).not.toContain(term);
    }
    // the only permitted use of the word is the public credential link field
    for (const cert of certifications) {
      expect(Object.keys(cert).filter(k => k.toLowerCase().includes('credential'))).toEqual([
        'credentialUrl',
      ]);
      expect(cert.credentialUrl).toMatch(/^\/[^/].*\.pdf$/);
    }
    // also check each experience bullet specifically
    for (const exp of snap.experience) {
      const bulletsText = exp.bullets.join(' ').toLowerCase();
      expect(bulletsText).not.toContain('cpt');
      expect(bulletsText).not.toContain('visa');
      expect(bulletsText).not.toContain('compensation');
    }
    // contact phone is excluded (privacy)
    expect((snap.contact as Record<string, unknown>).phone).toBeUndefined();
  });

  it('9 — evidence references remain resolvable', () => {
    const projectIds = new Set(PROJECTS.map(p => p.id));
    const expIds = new Set(EXPERIENCE.map(e => e.id));
    const pubIds = new Set(PUBLICATIONS.map(p => p.id));
    const leaderIds = new Set(LEADERSHIP.map(l => l.id));
    const certIds = new Set(CERTIFICATIONS.map(c => c.id));
    for (const skill of SKILLS) {
      for (const ev of skill.evidence ?? []) {
        let ok = false;
        if (ev.type === 'project') ok = projectIds.has(ev.id);
        else if (ev.type === 'experience') ok = expIds.has(ev.id);
        else if (ev.type === 'publication') ok = pubIds.has(ev.id);
        else if (ev.type === 'leadership') ok = leaderIds.has(ev.id);
        else if (ev.type === 'certification') ok = certIds.has(ev.id);
        expect(ok, `skill ${skill.id} evidence ${ev.type}:${ev.id} does not resolve`).toBe(true);
      }
    }
    // specifically, existing evidence pointing to infini-ai-intern still resolves
    const pythonSkill = SKILLS.find(s => s.id === 'python');
    expect(pythonSkill?.evidence?.some(e => e.id === 'infini-ai-intern')).toBe(true);
  });

  it('10 — no invented metrics exist in the new PROJXON record', () => {
    const projxon = EXPERIENCE.find(e => e.id === 'projxon-ai-intern');
    expect(projxon).toBeTruthy();
    const text = [projxon!.company, projxon!.role, projxon!.location, projxon!.period, ...projxon!.bullets, ...(projxon!.technologies ?? [])].join(' ');
    const lower = text.toLowerCase();
    // forbidden invented metric patterns
    expect(lower).not.toMatch(/\d+%/); // percentages
    expect(lower).not.toMatch(/\d+\s*users/);
    expect(lower).not.toMatch(/revenue/);
    expect(lower).not.toMatch(/\$[\d,]+/);
    expect(lower).not.toMatch(/\d+\s*hours?\s*saved/);
    expect(lower).not.toMatch(/\d+x\s*faster/);
    expect(lower).not.toMatch(/production scale/);
    expect(lower).not.toMatch(/team of \d+/);
    expect(lower).not.toMatch(/deployed to production/);
    expect(lower).not.toMatch(/fully autonomous/);
    expect(lower).not.toMatch(/revolutionary/);
    // ensure no numeric impact claims like "reduced by 30%"
    expect(text).not.toMatch(/\d+\s*%/);
    // ensure bullets are conservative and mention allowed themes
    const bulletsJoined = projxon!.bullets.join(' ').toLowerCase();
    expect(bulletsJoined).toContain('orkaat');
    expect(bulletsJoined).toContain('workflow');
    // should contain permission/approval or controlled workflow language
    expect(bulletsJoined).toMatch(/permission|approval|controlled/);
    // should NOT claim autonomous AI controls financial systems
    expect(lower).not.toContain('autonomous ai controls');
    expect(lower).not.toContain('autonomous agent controls');
  });
});
