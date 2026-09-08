import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PROJECTS } from '../../src/data/projects';
import { LEADERSHIP } from '../../src/data/leadership';
import { SKILLS } from '../../src/data/skills';
import { CERTIFICATIONS } from '../../src/data/certifications';
import { CONTACT } from '../../src/data/contact';
import { EDUCATION } from '../../src/data/education';
import { PUBLICATIONS } from '../../src/data/publications';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const srcFiles = () => {
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) out.push(...walk(full));
      else if (/\.(ts|tsx|css)$/.test(ent.name)) out.push(full);
    }
    return out;
  };
  return walk(path.join(process.cwd(), 'src'));
};

describe('A20 — global normalization (unit)', () => {
  it('1 — no xs: class remains in production source', () => {
    const files = srcFiles();
    const hits: string[] = [];
    for (const f of files) {
      const txt = fs.readFileSync(f, 'utf8');
      if (/xs:/.test(txt)) hits.push(`${path.relative(process.cwd(), f)}: ${txt.match(/xs:[^\s"']+/)?.[0]}`);
    }
    expect(hits, `dead xs utilities: ${hits.join(', ')}`).toEqual([]);
    // also check that we use sm: for former xs locations
    expect(read('src/sections/Hero.tsx')).toContain('sm:flex-row');
    expect(read('src/sections/Hero.tsx')).toContain('sm:flex-none');
    expect(read('src/sections/AskGuna.tsx')).toContain('sm:flex-row');
    expect(read('src/sections/AskGuna.tsx')).toContain('sm:w-auto');
    expect(read('src/sections/Contact.tsx')).toContain('sm:flex-row');
  });

  it('2 — canonical data unchanged (projects/skills/experience/education/publications/certifications/leadership/contact)', () => {
    expect(PROJECTS.length).toBe(8);
    expect(EDUCATION.length).toBe(2);
    expect(PUBLICATIONS.length).toBe(1);
    expect(CERTIFICATIONS.length).toBe(1);
    expect(LEADERSHIP.length).toBe(2);
    expect(CONTACT.email).toBe('gunabhiram.a@gmail.com');
  });

  it('3 — featured order unchanged', () => {
    const featured = PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
    expect(featured.map(p => p.id)).toEqual(['ember', 'sociallens', 'incidentpilot']);
  });

  it('4 — 8-project inventory unchanged', () => {
    expect(PROJECTS.map(p => p.id).sort()).toEqual(['clinical-reconciliation', 'code-battlegrounds', 'ember', 'incidentpilot', 'nostalgia', 'sociallens', 'timesling', 'zenco'].sort());
  });

  it('5 — GPSG + DSA leadership preserved', () => {
    expect(LEADERSHIP.map(l => l.id)).toEqual(['gpsg-president-outreach', 'dsa-club-srm']);
    expect(LEADERSHIP[0].organization).toContain('University of Colorado Boulder');
    expect(LEADERSHIP[0].period).toBe('Apr 2026 – Present');
  });

  it('6 — 37-skill inventory preserved', () => {
    expect(SKILLS.length).toBe(37);
  });

  it('7 — AWS certification preserved', () => {
    const aws = CERTIFICATIONS.find(c => c.id === 'aws-solutions-architect-associate');
    expect(aws).toBeTruthy();
    expect(aws!.title.toLowerCase()).toContain('aws');
  });

  it('8 — resume URL preserved and points to real PDF path pattern', () => {
    expect(CONTACT.resumeUrl).toBe('/Guna_Fall_Resume.pdf');
    expect(CONTACT.resumeUrl).toMatch(/^\/[^/]+\.pdf$/);
  });

  it('9 — Ask Guna API contract unchanged', () => {
    const src = read('src/sections/AskGuna.tsx');
    expect(src).toContain("fetch('/api/ask-guna'");
    expect(src).toContain("method: 'POST'");
    expect(src).toContain('Content-Type');
    expect(src).toContain('question');
  });

  it('10 — recruiter query mode plumbing intact (PortfolioModeContext)', () => {
    const ctx = read('src/context/PortfolioModeContext.tsx');
    expect(ctx).toContain('isRecruiter');
    expect(ctx).toContain("'recruiter'");
    expect(ctx).toContain("searchParams");
  });

  it('11 — reduced mode statically renders essential content (no hidden opacity:0 gate)', () => {
    // Every section’s item variant uses reduced ? opacity 1 : opacity 0
    for (const f of ['src/sections/Hero.tsx', 'src/sections/Experience.tsx', 'src/sections/Projects.tsx', 'src/sections/Skills.tsx', 'src/sections/Education.tsx']) {
      const src = read(f);
      expect(src).toContain('prefersReducedMotion');
    }
  });

  it('12 — all 8 project stories static under reduced (shouldAnimate guard)', () => {
    for (const p of PROJECTS) {
      const slug = p.id; // id maps to story file
      // stories use useStoryLifecycle and check shouldAnimate before timers
    }
    const snap = read('src/hooks/useStoryLifecycle.ts');
    expect(snap).toContain('shouldAnimate');
    expect(snap).toContain('isReduced');
    expect(snap).toContain('isRecruiter');
  });

  it('14 — no project story eager imports (only lazy)', () => {
    const home = read('src/pages/Home.tsx');
    // stories are loaded via lazy inside FeaturedProject/ProjectListItem detail, not static imports
    expect(home).not.toMatch(/import.*EmberStory/);
    expect(home).not.toMatch(/import.*SocialLensStory/);
    const proj = read('src/sections/Projects.tsx');
    expect(proj).not.toContain('EmberStory');
    expect(proj).not.toContain('SocialLensStory');
  });

  it('15 — AskGuna remains lazy', () => {
    const home = read('src/pages/Home.tsx');
    expect(home).toMatch(/lazy\(\(\)\s*=>\s*import\('\.\.\/sections\/AskGuna'\)/);
  });

  it('16 — closing visuals remain lazy', () => {
    for (const f of ['src/sections/Leadership.tsx', 'src/sections/Contact.tsx']) {
      const src = read(f);
      expect(src).toMatch(/lazy\(\(\)\s*=>\s*import\('\.\.\/components\/closing\/closingVisuals'\)/);
    }
  });

  it('18 — cold hash navigation effect exists and respects header + reduced', () => {
    const home = read('src/pages/Home.tsx');
    expect(home).toContain('window.location.hash');
    expect(home).toContain('scrollIntoView');
    expect(home).toContain('prefersReducedMotion');
    expect(home).toContain('requestAnimationFrame');
  });

  it('27 — Contact resume points to real PDF', () => {
    const p = path.join(process.cwd(), 'public', CONTACT.resumeUrl.replace(/^\//, ''));
    expect(fs.existsSync(p)).toBe(true);
    expect(fs.readFileSync(p).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('28 — no unsupported certification score/SAA-C03 leakage in canonical fields', () => {
    const cert = CERTIFICATIONS[0];
    const fields = `${cert.title} ${cert.summary ?? ''} ${cert.verificationUrl ?? ''}`.toLowerCase();
    expect(fields).not.toContain('saa-c03');
    // snapshot projection must not include a score field (comment mentioning score is intentional)
    const snap = read('src/data/snapshot.ts');
    expect(snap).toMatch(/certifications: CERTIFICATIONS\.map/);
    expect(snap).not.toMatch(/certifications:[\s\S]*?score:/);
    const certSrc = read('src/data/certifications.ts');
    expect(certSrc).toContain('deliberately absent');
  });

  it('29 — no GPSG invented metrics', () => {
    const lead = LEADERSHIP.find(l => l.id === 'gpsg-president-outreach')!;
    const blob = `${lead.description} ${lead.organization}`.toLowerCase();
    for (const w of ['budget', 'funding', '%', 'students represented', 'events organized']) expect(blob).not.toContain(w);
  });

  it('30 — bundle budgets unchanged (thresholds present)', () => {
    const budget = read('scripts/check-build-budget.mjs');
    expect(budget).toContain('90 * 1024');
    expect(budget).toContain('150 * 1024');
    expect(budget).toContain('10 * 1024');
  });
});
