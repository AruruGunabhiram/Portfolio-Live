import { describe, it, expect } from 'vitest';
import { PROFILE } from '../../src/data/profile';
import { CONTACT } from '../../src/data/contact';
import { EXPERIENCE } from '../../src/data/experience';
import { PROJECTS } from '../../src/data/projects';
import { EDUCATION } from '../../src/data/education';
import { PUBLICATIONS } from '../../src/data/publications';
import { SKILLS, SKILL_CATEGORIES } from '../../src/data/skills';
import { LEADERSHIP } from '../../src/data/leadership';
import { CERTIFICATIONS } from '../../src/data/certifications';

function unique<T>(arr: T[]) {
  return new Set(arr).size === arr.length;
}

describe('21D — data integrity invariants', () => {
  it('PROFILE has required public fields', () => {
    expect(PROFILE.name).toBe('Gunabhiram Aruru');
    expect(PROFILE.headline).toBeTruthy();
    expect(PROFILE.valueProposition).toBeTruthy();
  });

  it('EXPERIENCE IDs are unique and present', () => {
    expect(EXPERIENCE.length).toBeGreaterThanOrEqual(1);
    expect(unique(EXPERIENCE.map(e => e.id))).toBe(true);
  });

  it('PROJECT IDs unique, slugs unique', () => {
    expect(unique(PROJECTS.map(p => p.id))).toBe(true);
    expect(unique(PROJECTS.map(p => p.slug))).toBe(true);
  });

  it('exactly 3 featured projects', () => {
    const featured = PROJECTS.filter(p => p.featured);
    expect(featured.length).toBe(3);
  });

  it('featuredOrder unique and sequential 1..3', () => {
    const featured = PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    const orders = featured.map(p => p.featuredOrder);
    expect(orders).toEqual([1, 2, 3]);
    expect(unique(orders as number[])).toBe(true);
  });

  it('21E — featured set is SocialLens, Creator Copilot, Code Battlegrounds in order', () => {
    const featured = PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    const ids = featured.map(p => p.id);
    expect(ids).toEqual(['sociallens', 'creator-copilot', 'code-battlegrounds']);
    if (ids.join(',') !== 'sociallens,creator-copilot,code-battlegrounds') {
      throw new Error(`Expected exactly 3 featured projects, found ${featured.length}: ${featured.map(p => p.title).join(', ')}`);
    }
  });

  it('EDUCATION IDs unique', () => {
    expect(unique(EDUCATION.map(e => e.id))).toBe(true);
  });

  it('PUBLICATION IDs unique', () => {
    expect(unique(PUBLICATIONS.map(p => p.id))).toBe(true);
  });

  it('LEADERSHIP IDs unique', () => {
    expect(unique(LEADERSHIP.map(l => l.id))).toBe(true);
  });

  it('SKILLS IDs unique and categories valid', () => {
    expect(unique(SKILLS.map(s => s.id))).toBe(true);
    const cats = new Set(SKILL_CATEGORIES.map(c => c.id));
    for (const s of SKILLS) {
      expect(cats.has(s.category), `skill ${s.id} has invalid category ${s.category}`).toBe(true);
    }
  });

  it('skill evidence references resolve to existing entities', () => {
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
        else ok = false;
        expect(ok, `skill ${skill.id} evidence ${ev.type}:${ev.id} does not resolve`).toBe(true);
      }
    }
  });

  it('CERTIFICATIONS array valid (currently empty) — 21G', () => {
    expect(Array.isArray(CERTIFICATIONS)).toBe(true);
    // Empty-state invariant: if zero, section should be absent; not asserting count permanently
    if (CERTIFICATIONS.length === 0) {
      expect(CERTIFICATIONS.length).toBe(0);
    }
  });

  it('CONTACT has required public links', () => {
    expect(CONTACT.email).toMatch(/@/);
    expect(CONTACT.linkedinUrl).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
    expect(CONTACT.githubUrl).toMatch(/^https:\/\/github\.com\//);
    expect(CONTACT.resumeUrl).toBeTruthy();
  });

  it('project URL structure guard — 21F (no silent transform)', () => {
    for (const p of PROJECTS) {
      if (p.links.github) {
        expect(p.links.github).toMatch(/^https:\/\/github\.com\//);
      }
      if (p.links.live) {
        expect(p.links.live).toMatch(/^https:\/\//);
      }
    }
  });

  it('21AB — peer-reviewed not claimed unless model supports it', () => {
    // Canonical publication has no peerReviewed field; UI must not claim it
    // Check that publication type does not contain invented field
    for (const pub of PUBLICATIONS) {
      expect((pub as unknown as Record<string, unknown>).peerReviewed).toBeUndefined();
    }
    // Ensure headline/valueProposition don't contain claim
    const haystack = `${PROFILE.headline} ${PROFILE.valueProposition} ${PUBLICATIONS.map(p => p.title).join(' ')}`.toLowerCase();
    expect(haystack).not.toContain('peer-reviewed');
    expect(haystack).not.toContain('peer reviewed');
  });

  it('21AC — AWS/certification claims not present while certs empty', () => {
    if (CERTIFICATIONS.length === 0) {
      const allText = [
        PROFILE.headline,
        PROFILE.valueProposition,
        ...PROJECTS.map(p => p.title + ' ' + p.summary),
        ...SKILLS.map(s => s.name),
      ].join(' ').toLowerCase();
      // Skills contain "aws" as tech label (allowed in devops list) but headline must not claim certified
      expect(PROFILE.headline.toLowerCase()).not.toContain('aws certified');
      expect(PROFILE.headline.toLowerCase()).not.toContain('certified');
      // Ensure no "AWS Certified" badge string in profile
      expect(allText).not.toContain('aws certified');
    }
  });
});
