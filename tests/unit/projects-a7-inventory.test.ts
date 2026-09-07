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
      // every project must carry at least one real link, except Ember whose repo is private (A7B)
      if (p.id !== 'ember') {
        expect(Object.values(p.links).filter(Boolean).length, `${p.id} has no links`).toBeGreaterThan(0);
      }
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

const CANONICAL_ORDER = [
  'ember',
  'sociallens',
  'incidentpilot',
  'clinical-reconciliation',
  'code-battlegrounds',
  'timesling',
  'zenco',
  'nostalgia',
];

const CONTRIBUTIONS: Record<string, 'solo' | 'co-built' | 'contributor'> = {
  ember: 'solo',
  sociallens: 'solo',
  incidentpilot: 'solo',
  'clinical-reconciliation': 'solo',
  'code-battlegrounds': 'co-built',
  timesling: 'solo',
  zenco: 'co-built',
  nostalgia: 'co-built',
};

// Identifiers from the private source repository that must never reach public data.
const PRIVATE_IDENTIFIERS = [
  'Personal-BOT',
  'Personal_BOT',
  'personal-bot',
  'Job-automation',
  'job_automation',
  'CPT',
  'aruru_resume',
];

describe('A7B — final project inventory reconciliation', () => {
  it('1 — exactly 8 canonical projects', () => {
    expect(PROJECTS).toHaveLength(8);
  });

  it('2 — ids appear in the exact canonical order', () => {
    expect(PROJECTS.map(p => p.id)).toEqual(CANONICAL_ORDER);
    expect(PROJECTS.map(p => p.slug)).toEqual(CANONICAL_ORDER);
  });

  it('3 — Creator Copilot is absent everywhere, including as hidden/archived record', () => {
    const blob = JSON.stringify(PROJECTS).toLowerCase();
    expect(PROJECTS.some(p => p.id === 'creator-copilot')).toBe(false);
    expect(blob).not.toContain('creator-copilot');
    expect(blob).not.toContain('creator copilot');
  });

  it('4 — Extinction is absent, with no placeholder or coming-soon card', () => {
    const blob = JSON.stringify(PROJECTS).toLowerCase();
    expect(blob).not.toContain('extinction');
  });

  it('5 — Ember is present exactly once', () => {
    const ember = PROJECTS.filter(p => p.id === 'ember');
    expect(ember).toHaveLength(1);
    expect(ember[0].title).toBe('Ember');
    expect(ember[0].subtitle).toBe('Personal AI Execution Assistant');
  });

  it('6 — no separate Worthy project record', () => {
    expect(PROJECTS.some(p => /worthy/i.test(`${p.id} ${p.slug} ${p.title}`))).toBe(false);
  });

  it('7 — Ember exposes no GitHub link (repository is private)', () => {
    const ember = PROJECTS.find(p => p.id === 'ember')!;
    expect(ember.links.github).toBeUndefined();
    expect(ember.links.live).toBeUndefined();
    expect(Object.values(ember.links).filter(Boolean)).toHaveLength(0);
  });

  it('8 — Ember public text contains no private repo or personal identifiers', () => {
    const ember = PROJECTS.find(p => p.id === 'ember')!;
    const blob = JSON.stringify(ember);
    for (const id of PRIVATE_IDENTIFIERS) {
      expect(blob, `Ember leaks ${id}`).not.toContain(id);
    }
    expect(blob).not.toMatch(/visa|H-?1B|OPT\b|immigration/i);
    expect(blob).not.toMatch(/@[a-z0-9.-]+\.(com|edu|org|net)/i);
    expect(blob).not.toMatch(/\/(Users|home)\/[a-z]/i);
    expect(blob).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    expect(blob).not.toMatch(/API_KEY|SECRET|TOKEN=|password/i);
  });

  it('9 — Ember avoids overstated autonomy claims', () => {
    const ember = PROJECTS.find(p => p.id === 'ember')!;
    const blob = [ember.subtitle, ember.summary, ...ember.highlights].join(' ');
    expect(blob).not.toMatch(/fully autonomous|production-scale|automatically applies/i);
    expect(blob).toMatch(/human handoff|approval/i);
  });

  it('10 — featured set is exactly Ember, SocialLens, IncidentPilot', () => {
    const featured = PROJECTS.filter(p => p.featured).map(p => p.id);
    expect(featured).toEqual(['ember', 'sociallens', 'incidentpilot']);
  });

  it('11 — featured orders are exactly 1 / 2 / 3', () => {
    const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
    expect(byId['ember'].featuredOrder).toBe(1);
    expect(byId['sociallens'].featuredOrder).toBe(2);
    expect(byId['incidentpilot'].featuredOrder).toBe(3);
    for (const p of PROJECTS.filter(p => !p.featured)) {
      expect(p.featuredOrder, `${p.id}`).toBeUndefined();
    }
  });

  it('12 — every project carries a valid contribution value', () => {
    const valid = new Set(['solo', 'co-built', 'contributor']);
    for (const p of PROJECTS) {
      expect(p.contribution, `${p.id} contribution`).toBeDefined();
      expect(valid.has(p.contribution!), `${p.id} = ${p.contribution}`).toBe(true);
      expect(p.contribution, `${p.id}`).toBe(CONTRIBUTIONS[p.id]);
    }
  });

  it('13 — collaborative projects are not framed as solo work', () => {
    const coBuilt = PROJECTS.filter(p => p.contribution === 'co-built');
    expect(coBuilt.map(p => p.id)).toEqual(['code-battlegrounds', 'zenco', 'nostalgia']);
    for (const p of coBuilt) {
      const blob = [p.summary, ...p.highlights].join(' ');
      expect(blob, `${p.id} must acknowledge collaboration`).toMatch(/teammate|with a friend|collaborative|class project/i);
    }
  });

  it('14 — Zenco does not claim sole authorship of the engine architecture', () => {
    const zenco = PROJECTS.find(p => p.id === 'zenco')!;
    const blob = [zenco.summary, ...zenco.highlights].join(' ');
    expect(blob).not.toMatch(/I architected|I implemented the full|built the entire/i);
    expect(blob).toMatch(/VS Code extension/i);
  });

  it('15 — no ownership metrics are exposed on any project', () => {
    const blob = JSON.stringify(PROJECTS);
    expect(blob).not.toMatch(/ownershipPercentage|commitCount|teamSize/);
    for (const p of PROJECTS) {
      expect(Object.keys(p)).not.toContain('ownershipPercentage');
      expect(Object.keys(p)).not.toContain('commitCount');
      expect(Object.keys(p)).not.toContain('teamSize');
    }
  });

  it('16 — no dangling skill evidence of any type', () => {
    const known: Record<string, Set<string>> = {
      project: new Set(PROJECTS.map(p => p.id)),
      experience: new Set(EXPERIENCE.map(e => e.id)),
    };
    const dangling: string[] = [];
    for (const s of SKILLS) {
      for (const e of s.evidence ?? []) {
        const set = known[e.type];
        if (set && !set.has(e.id)) dangling.push(`${s.id} -> ${e.type}:${e.id}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it('17 — Creator Copilot skill evidence is fully removed', () => {
    expect(JSON.stringify(SKILLS)).not.toContain('creator-copilot');
    const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
    // re-pointed to the remaining verified sources
    expect(byId['java'].evidence?.map(e => e.id)).toEqual(['sociallens']);
    expect(byId['spring-boot'].evidence?.map(e => e.id)).toEqual(['sociallens']);
    expect(byId['rest-apis'].evidence?.map(e => e.id)).toContain('sociallens');
    expect(byId['llm-api-integration'].evidence?.map(e => e.id)).toContain('incidentpilot');
    expect(byId['explainable-ai'].evidence?.map(e => e.id)).toContain('incidentpilot');
    expect(byId['hallucination-guardrails'].evidence?.map(e => e.id)).toContain('incidentpilot');
    // analytics-grounded prompting had no verified source left after removal
    expect(byId['analytics-grounded-prompting']).toBeUndefined();
  });

  it('18 — Zenco evidence reflects only Guna\u2019s verified scope', () => {
    const byId = Object.fromEntries(SKILLS.map(s => [s.id, s]));
    const zencoBacked = SKILLS.filter(s => (s.evidence ?? []).some(e => e.type === 'project' && e.id === 'zenco')).map(s => s.id);
    expect(zencoBacked.sort()).toEqual(['modular-architecture', 'oop', 'typescript', 'vscode-api']);
    // engine-authorship claims dropped
    expect(byId['design-patterns'].evidence).toBeUndefined();
    expect(byId['python'].evidence?.map(e => e.id)).not.toContain('zenco');
  });

  it('19 — Ask Guna snapshot exposes only public-safe Ember content', () => {
    const snap = getPublicPortfolioSnapshot();
    const ember = snap.projects.find(p => p.id === 'ember')!;
    expect(ember).toBeDefined();
    expect(ember.links).toEqual({});
    const blob = JSON.stringify(snap);
    for (const id of PRIVATE_IDENTIFIERS) {
      expect(blob, `snapshot leaks ${id}`).not.toContain(id);
    }
    expect(blob).not.toContain('creator-copilot');
    expect(snap.projects).toHaveLength(8);
  });

  it('20 — Experience and its A6 ordering are unaffected', () => {
    expect(EXPERIENCE).toHaveLength(2);
    expect(EXPERIENCE.map(e => e.id)).toEqual(['projxon-ai-intern', 'infini-ai-intern']);
    const experienceBacked = SKILLS.filter(s => (s.evidence ?? []).some(e => e.type === 'experience')).map(s => s.id);
    expect(experienceBacked).toContain('python');
    expect(experienceBacked).toContain('flask');
  });
});
