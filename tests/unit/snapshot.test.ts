import { describe, it, expect } from 'vitest';
import { getPublicPortfolioSnapshot } from '../../src/data/snapshot';
import { CONTACT } from '../../src/data/contact';
import { PROFILE } from '../../src/data/profile';

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
