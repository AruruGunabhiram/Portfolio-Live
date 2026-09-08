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

  it('21E — featured set is Ember, SocialLens, IncidentPilot in order (A7B)', () => {
    const featured = PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    const ids = featured.map(p => p.id);
    expect(ids).toEqual(['ember', 'sociallens', 'incidentpilot']);
    if (ids.join(',') !== 'ember,sociallens,incidentpilot') {
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

  it('CERTIFICATIONS holds exactly the one verified AWS credential — 21G', () => {
    expect(Array.isArray(CERTIFICATIONS)).toBe(true);
    expect(CERTIFICATIONS).toHaveLength(1);

    const [cert] = CERTIFICATIONS;
    expect(cert.id).toBe('aws-solutions-architect-associate');
    expect(cert.title).toBe('AWS Certified Solutions Architect - Associate');
    expect(cert.issuer).toBe('Amazon Web Services (AWS)');
    expect(cert.year).toBe(2026);
    expect(cert.summary).toBe('Issued August 30, 2026. Valid through August 30, 2029.');

    // no duplicates
    expect(new Set(CERTIFICATIONS.map(c => c.id)).size).toBe(CERTIFICATIONS.length);
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

  it('21AC — the certification record carries only certificate-supported facts', () => {
    const [cert] = CERTIFICATIONS;
    const record = cert as unknown as Record<string, unknown>;
    const serialized = JSON.stringify(CERTIFICATIONS);

    // The exam score is private and must never reach the repository or the page.
    expect(serialized).not.toContain('915');
    expect(serialized).not.toContain('1000');
    expect(serialized.toLowerCase()).not.toContain('score');

    // The certificate prints no exam code, so SAA-C03 must not be asserted.
    expect(serialized.toLowerCase()).not.toContain('saa-c03');

    // No credential/validation number is republished, and no such field was invented.
    expect(serialized.toLowerCase()).not.toContain('ea628dde');
    expect(record.credentialId).toBeUndefined();
    expect(record.validationNumber).toBeUndefined();

    // The link is proof display (the local public certificate), not an issuer
    // verification endpoint — a generic landing page cannot verify a credential.
    expect(cert.credentialUrl).toBe(
      '/AWS%20Certified%20Solutions%20Architect%20-%20Associate%20certificate.pdf'
    );
    expect(cert.credentialUrl).not.toMatch(/aws\.amazon\.com/);
    expect(cert.credentialUrl!.startsWith('/')).toBe(true);
    expect(cert.credentialUrl).not.toMatch(/^\.?\/?public\//);
    expect(cert.credentialUrl).not.toMatch(/localhost|127\.0\.0\.1|\/Users\//);

    // Certification claims stay inside the certification record: the profile itself
    // still makes no standalone "certified" claim.
    const profileText = `${PROFILE.headline} ${PROFILE.valueProposition}`.toLowerCase();
    expect(profileText).not.toContain('aws certified');
    const projectText = PROJECTS.map(p => `${p.title} ${p.summary}`).join(' ').toLowerCase();
    expect(projectText).not.toContain('aws certified');
    expect(SKILLS.map(s => s.name).join(' ').toLowerCase()).not.toContain('certified');
  });
});
