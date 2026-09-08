import { describe, it, expect } from 'vitest';
import { getPublicPortfolioSnapshot } from '../../src/data/snapshot';
import { CONTACT } from '../../src/data/contact';
import { PROFILE } from '../../src/data/profile';
import { CERTIFICATIONS } from '../../src/data/certifications';

describe('21Y / 21BZ / 21BO — public snapshot privacy', () => {
  it('includes expected public classes', () => {
    const snap = getPublicPortfolioSnapshot();
    expect(snap.profile).toBeTruthy();
    expect(snap.experience).toBeTruthy();
    expect(snap.projects).toBeTruthy();
    expect(snap.education).toBeTruthy();
    expect(snap.publications).toBeTruthy();
    expect(snap.skills).toBeTruthy();
    expect(snap.leadership).toBeTruthy();
    expect(snap.contact).toBeTruthy();
  });

  it('contact excludes phone (Ask Guna privacy)', () => {
    const snap = getPublicPortfolioSnapshot();
    expect((snap.contact as Record<string, unknown>).phone).toBeUndefined();
    // but visible CONTACT still has phone (UI renders it) – snapshot excludes only
    expect(CONTACT.phone).toBeTruthy();
  });

  it('snapshot excludes IMPACT_HIGHLIGHTS and private fields', () => {
    const snap = getPublicPortfolioSnapshot() as Record<string, unknown>;
    expect(snap.IMPACT_HIGHLIGHTS).toBeUndefined();
    expect(snap.apiKey).toBeUndefined();
    const json = JSON.stringify(snap);
    expect(json).not.toContain('IMPACT_HIGHLIGHTS');
    expect(json).not.toContain('GROQ_API_KEY');
    expect(json).not.toContain('gsk_');
  });

  it('snapshot contact has only allowlisted public links', () => {
    const snap = getPublicPortfolioSnapshot();
    expect(snap.contact.email).toBe(CONTACT.email);
    expect(snap.contact.linkedinUrl).toBe(CONTACT.linkedinUrl);
    expect(snap.contact.githubUrl).toBe(CONTACT.githubUrl);
    expect(snap.contact.resumeUrl).toBe(CONTACT.resumeUrl);
    expect(Object.keys(snap.contact).sort()).toEqual(['email', 'github', 'githubUrl', 'linkedin', 'linkedinUrl', 'resumeUrl'].sort());
  });

  it('projects in snapshot are trimmed (no caseStudy bodies leaked fully)', () => {
    const snap = getPublicPortfolioSnapshot();
    for (const p of snap.projects) {
      expect(p.id).toBeTruthy();
      // caseStudy only has oneLiner + headings, not full content bullets
      if (p.caseStudy) {
        expect((p.caseStudy as Record<string, unknown>).sections).toBeUndefined();
      }
    }
  });

  it('profile in snapshot matches canonical', () => {
    const snap = getPublicPortfolioSnapshot();
    expect(snap.profile.name).toBe(PROFILE.name);
  });
});

describe('A17C — certifications in the public snapshot (Ask Guna context)', () => {
  const snap = getPublicPortfolioSnapshot();
  const certs = snap.certifications;

  it('certifications are exposed and derived from canonical CERTIFICATIONS', () => {
    expect(Array.isArray(certs)).toBe(true);
    expect(certs).toHaveLength(CERTIFICATIONS.length);
    expect(certs.map(c => c.id)).toEqual(CERTIFICATIONS.map(c => c.id));
  });

  it('exposes exactly the canonical AWS certification', () => {
    expect(certs).toHaveLength(1);
    const [cert] = certs;
    expect(cert.id).toBe('aws-solutions-architect-associate');
    expect(cert.title).toBe('AWS Certified Solutions Architect - Associate');
    expect(cert.issuer).toBe('Amazon Web Services (AWS)');
    expect(cert.year).toBe(2026);
    expect(cert.credentialUrl).toBe(
      '/AWS%20Certified%20Solutions%20Architect%20-%20Associate%20certificate.pdf'
    );
  });

  it('projection is the allowlisted field set only', () => {
    for (const cert of certs) {
      expect(Object.keys(cert).sort()).toEqual(
        ['credentialUrl', 'id', 'issuer', 'title', 'verificationUrl', 'year'].sort()
      );
      // `summary` carries issue/expiry prose — not part of the Ask Guna projection
      expect((cert as Record<string, unknown>).summary).toBeUndefined();
    }
  });

  it('credentialUrl is the local public certificate asset, not an issuer verification page', () => {
    for (const cert of certs) {
      expect(cert.credentialUrl).toMatch(/^\/[^/]/);
      expect(cert.credentialUrl).toMatch(/\.pdf$/);
      expect(cert.credentialUrl).not.toMatch(/^https?:/);
    }
  });

  it('no score, validation number, exam code or private identifier leaks into the snapshot', () => {
    const json = JSON.stringify(snap);
    // score and exam code are never published anywhere in this repository
    expect(json).not.toContain('915');
    expect(json).not.toContain('/1000');
    expect(json).not.toContain('SAA-C03');
    expect(json).not.toContain('SAA-C0');
    expect(json).not.toMatch(/candidate\s*id/i);
    expect(json).not.toMatch(/account\s*id/i);
    // no local filesystem paths anywhere in the snapshot
    expect(json).not.toContain('/Users/');
    expect(json).not.toContain('public/AWS');

    // "validation" is scoped to the certification projection — the word legitimately
    // appears elsewhere (e.g. a project highlight about input validation)
    const certJson = JSON.stringify(certs);
    expect(certJson).not.toMatch(/validation/i);
    expect(certJson).not.toMatch(/score/i);
    expect(certJson).not.toMatch(/expir/i);
    expect(certJson).not.toMatch(/valid through/i);
  });

  it('adding certifications did not disturb existing snapshot classes', () => {
    expect(snap.projects.length).toBeGreaterThan(0);
    expect(snap.experience.length).toBeGreaterThan(0);
    expect(snap.publications.length).toBeGreaterThan(0);
    expect(Object.keys(snap.contact).sort()).toEqual(
      ['email', 'github', 'githubUrl', 'linkedin', 'linkedinUrl', 'resumeUrl'].sort()
    );
    expect((snap.contact as Record<string, unknown>).phone).toBeUndefined();
  });

  it('resume URL carried into the snapshot is the corrected asset (A17C)', () => {
    expect(snap.contact.resumeUrl).toBe('/Guna_Fall_Resume.pdf');
    expect(snap.contact.resumeUrl).not.toBe('/Gunabhiram_Resume.pdf');
  });
});
