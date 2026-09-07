import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../../src/data/projects';
import { SKILLS } from '../../src/data/skills';
import { EXPERIENCE } from '../../src/data/experience';
import { getPublicPortfolioSnapshot } from '../../src/data/snapshot';

describe('A7 — project inventory reconciliation', () => {
  it('1 — project ids and slugs are unique', () => {
    const ids = PROJECTS.map(p => p.id);
    const slugs = PROJECTS.map(p => p.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('2 — required schema fields are present and non-empty', () => {
    for (const p of PROJECTS) {
      expect(p.id, `${p.id} id`).toMatch(/^[a-z0-9-]+$/);
      expect(p.slug, `${p.id} slug`).toMatch(/^[a-z0-9-]+$/);
      expect(p.title.trim().length, `${p.id} title`).toBeGreaterThan(0);
      expect(p.subtitle.trim().length, `${p.id} subtitle`).toBeGreaterThan(0);
      expect(p.summary.trim().length, `${p.id} summary`).toBeGreaterThan(0);
      expect(p.categories.length, `${p.id} categories`).toBeGreaterThan(0);
      expect(p.technologies.length, `${p.id} technologies`).toBeGreaterThan(0);
      expect(p.highlights.length, `${p.id} highlights`).toBeGreaterThan(0);
      expect(typeof p.featured, `${p.id} featured`).toBe('boolean');
      expect(p.links, `${p.id} links`).toBeDefined();
    }
  });

  it('3 — no dangling project evidence in SKILLS', () => {
    const ids = new Set(PROJECTS.map(p => p.id));
    const dangling: string[] = [];
    for (const s of SKILLS) {
      for (const e of s.evidence ?? []) {
        if (e.type === 'project' && !ids.has(e.id)) dangling.push(`${s.id} -> ${e.id}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it('4 — featured references are valid and internally consistent', () => {
    const featured = PROJECTS.filter(p => p.featured);
    expect(featured.length).toBeGreaterThan(0);
    for (const p of featured) {
      expect(typeof p.featuredOrder, `${p.id} featuredOrder`).toBe('number');
    }
    const orders = featured.map(p => p.featuredOrder as number).sort((a, b) => a - b);
    expect(new Set(orders).size).toBe(orders.length);
    expect(orders).toEqual(orders.map((_, i) => i + 1));
    // non-featured projects must not carry a featuredOrder
    for (const p of PROJECTS.filter(p => !p.featured)) {
      expect(p.featuredOrder, `${p.id} must not set featuredOrder`).toBeUndefined();
    }
  });

  it('5 — public snapshot exposes no secrets or private surfaces', () => {
    const json = JSON.stringify(getPublicPortfolioSnapshot().projects);
    // credential-shaped tokens
    expect(json).not.toMatch(/api[_-]?key\s*[:=]\s*['"][^'"]+/i);
    expect(json).not.toMatch(/\b(?:sk|gho|ghp|github_pat|AKIA)[-_A-Za-z0-9]{10,}/);
    expect(json).not.toMatch(/-----BEGIN [A-Z ]*PRIVATE KEY-----/);
    expect(json).not.toMatch(/GEMINI_API_KEY|ANTHROPIC_API_KEY|SUPABASE_[A-Z_]*KEY/);
    // no localhost / internal / non-public hosts in any exposed link
    for (const p of getPublicPortfolioSnapshot().projects) {
      for (const [key, url] of Object.entries(p.links)) {
        if (!url) continue;
        expect(new URL(url).hostname, `${p.id}.${key}`).not.toMatch(/^(localhost|127\.0\.0\.1)$|\.internal$|\.local$/i);
      }
    }
    // no private repo names leaked as project links
    for (const bad of ['OrkaATS-v1-9', 'Orka_ATS-OrkaFin', 'Job-automation', 'Personal-BOT', 'Projxon-Monitor', 'HR_ATS_Tool']) {
      expect(json).not.toContain(bad);
    }
  });

  it('6 — Ember/Worthy is not represented as two duplicate entries', () => {
    const names = PROJECTS.map(p => `${p.id} ${p.title}`.toLowerCase());
    const ember = names.filter(n => /\bember\b/.test(n)).length;
    const worthy = names.filter(n => /\bworthy\b/.test(n)).length;
    expect(ember + worthy).toBeLessThanOrEqual(1);
  });

  it('7 — no unsupported placeholder projects', () => {
    for (const p of PROJECTS) {
      const blob = [p.summary, p.subtitle, ...p.highlights].join(' ');
      expect(blob, `${p.id}`).not.toMatch(/\b(TBD|TODO|Coming soon|Lorem ipsum|placeholder|FIXME)\b/i);
      // every project must carry at least one real link
      expect(Object.values(p.links).filter(Boolean).length, `${p.id} has no links`).toBeGreaterThan(0);
    }
  });

  it('8 — project URLs are syntactically valid https URLs', () => {
    for (const p of PROJECTS) {
      for (const [key, url] of Object.entries(p.links)) {
        if (!url) continue;
        expect(() => new URL(url), `${p.id}.${key}`).not.toThrow();
        expect(new URL(url).protocol, `${p.id}.${key}`).toBe('https:');
      }
      if (p.links.github) expect(p.links.github).toMatch(/^https:\/\/github\.com\/[\w.-]+(\/[\w.-]+)?$/);
    }
  });

  it('9 — verified project facts are preserved', () => {
    const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));

    expect(byId['sociallens']).toBeDefined();
    expect(byId['sociallens'].links.github).toBe('https://github.com/AruruGunabhiram/SocialLens');
    expect(byId['sociallens'].featured).toBe(true);
    expect(byId['sociallens'].caseStudy?.sections.length).toBeGreaterThan(0);

    expect(byId['code-battlegrounds'].links.github).toBe('https://github.com/Kanyarasi2026/code-battle-grounds');
    expect(byId['code-battlegrounds'].links.live).toBe('https://code-battle-grounds.vercel.app');

    expect(byId['timesling'].links.github).toBe('https://github.com/AruruGunabhiram/TimeSling-fresh');
    expect(byId['zenco'].links.github).toBe('https://github.com/paudelnirajan/zenco-vscode-extension');
    expect(byId['nostalgia'].links.github).toBe('https://github.com/Meghan31/nostalgia-copy-paste-extension');

    // A7 additions, sourced from the repo resume + public repositories
    expect(byId['incidentpilot'].links.github).toBe('https://github.com/AruruGunabhiram/IncidentPilot');
    expect(byId['clinical-reconciliation'].links.github).toBe('https://github.com/AruruGunabhiram/clinical-reconciliation');
    expect(byId['clinical-reconciliation'].links.live).toBe('https://clinical-reconciliation.vercel.app');
  });

  it('10 — Clinical Reconciliation makes no unsupported clinical claims', () => {
    const p = PROJECTS.find(p => p.id === 'clinical-reconciliation')!;
    const blob = [p.summary, p.subtitle, ...p.highlights].join(' ');
    expect(blob).not.toMatch(/HIPAA|patient outcome|hospital deployment|diagnos(is|tic)|FDA|clinically validated|clinical accuracy|real patient/i);
  });

  it('11 — Experience inventory is unaffected by project reconciliation', () => {
    expect(EXPERIENCE.map(e => e.id)).toEqual(['projxon-ai-intern', 'infini-ai-intern']);
    // professional Orka work stays in Experience, not in PROJECTS
    const projectBlob = JSON.stringify(PROJECTS).toLowerCase();
    expect(projectBlob).not.toContain('orkaats');
    expect(projectBlob).not.toContain('orkafin');
  });
});
