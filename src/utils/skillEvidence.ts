/**
 * A18 — the one canonical Skill → evidence resolver.
 *
 * Every label and href below is derived from canonical portfolio data. Nothing is
 * hand-written here, so a skill can never claim evidence that the rest of the site
 * does not also show. A reference that does not resolve returns null and is dropped
 * rather than rendered as a dangling row.
 *
 * This lives outside Skills.tsx so the UI and the tests exercise the same function.
 * Before A18 the test file kept its own copy of this logic, which had already drifted
 * from the component (it labelled experience `company — role`, the component used
 * `companyShort`), so the suite was asserting against a mirror instead of the code.
 */

import { PROJECTS } from '../data/projects';
import { EXPERIENCE } from '../data/experience';
import { PUBLICATIONS } from '../data/publications';
import { CERTIFICATIONS } from '../data/certifications';
import { LEADERSHIP } from '../data/leadership';
import type { Skill, SkillEvidence, SkillEvidenceType } from '../types/portfolio';

export interface ResolvedEvidence {
  type: SkillEvidenceType;
  /** Canonical display label, always read from the source record. */
  label: string;
  /** Quiet source-type label — shows range without dominating the row. */
  typeLabel: string;
  /** In-page destination for the section that actually holds the proof. */
  href: string;
}

/** Section anchors that already exist in the page. */
const HREF: Record<SkillEvidenceType, string> = {
  project: '#projects',
  experience: '#experience',
  publication: '#publications',
  certification: '#certifications',
  leadership: '#leadership',
};

export function resolveSkillEvidence(ev: SkillEvidence): ResolvedEvidence | null {
  switch (ev.type) {
    case 'project': {
      const p = PROJECTS.find(x => x.id === ev.id);
      // Title only. Skills must not imply solo ownership for co-built projects —
      // contribution truth stays with the Projects section that can express it fully.
      return p ? { type: ev.type, label: p.title, typeLabel: 'Project', href: HREF.project } : null;
    }
    case 'experience': {
      const e = EXPERIENCE.find(x => x.id === ev.id);
      return e
        ? { type: ev.type, label: e.companyShort ?? e.company, typeLabel: 'Experience', href: HREF.experience }
        : null;
    }
    case 'publication': {
      const pub = PUBLICATIONS.find(x => x.id === ev.id);
      // Venue + year, never a fabricated citation count or impact claim.
      return pub
        ? { type: ev.type, label: `${pub.venue} · ${pub.year}`, typeLabel: 'Publication', href: HREF.publication }
        : null;
    }
    case 'certification': {
      const c = CERTIFICATIONS.find(x => x.id === ev.id);
      // Canonical title only — no score, validation number or exam code.
      return c ? { type: ev.type, label: c.title, typeLabel: 'Certification', href: HREF.certification } : null;
    }
    case 'leadership': {
      const l = LEADERSHIP.find(x => x.id === ev.id);
      return l ? { type: ev.type, label: l.organization, typeLabel: 'Leadership', href: HREF.leadership } : null;
    }
    default:
      return null;
  }
}

/** Resolved evidence for a skill, in canonical array order (no invented ranking). */
export function resolveSkillEvidenceList(skill: Skill): ResolvedEvidence[] {
  if (!skill.evidence?.length) return [];
  return skill.evidence
    .map(resolveSkillEvidence)
    .filter((v): v is ResolvedEvidence => v !== null);
}

/** Neutral count phrasing — never "verified"/"proven". */
export function evidenceCountLabel(n: number): string {
  if (n === 0) return 'No linked portfolio evidence yet';
  return `${n} linked ${n === 1 ? 'source' : 'sources'}`;
}
