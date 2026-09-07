import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../../src/data/projects';
import { EXPERIENCE } from '../../src/data/experience';
import { PUBLICATIONS } from '../../src/data/publications';
import { LEADERSHIP } from '../../src/data/leadership';
import { CERTIFICATIONS } from '../../src/data/certifications';
import type { SkillEvidence } from '../../src/types/portfolio';

// mirrors 21U — generic resolver logic used by Skills UI
function resolveEvidence(ev: SkillEvidence): { label: string; href: string } | null {
  if (ev.type === 'project') {
    const p = PROJECTS.find(x => x.id === ev.id);
    return p ? { label: p.title, href: '#projects' } : null;
  }
  if (ev.type === 'experience') {
    const e = EXPERIENCE.find(x => x.id === ev.id);
    return e ? { label: `${e.company} — ${e.role}`, href: '#experience' } : null;
  }
  if (ev.type === 'publication') {
    const pub = PUBLICATIONS.find(x => x.id === ev.id);
    return pub ? { label: pub.title, href: '#publications' } : null;
  }
  if (ev.type === 'leadership') {
    const l = LEADERSHIP.find(x => x.id === ev.id);
    return l ? { label: l.organization, href: '#leadership' } : null;
  }
  if (ev.type === 'certification') {
    const c = CERTIFICATIONS.find(x => x.id === ev.id);
    return c ? { label: c.title, href: '#certifications' } : null;
  }
  return null;
}

describe('21U — skill evidence resolver', () => {
  it('project evidence resolves to project title + #projects', () => {
    const r = resolveEvidence({ type: 'project', id: 'sociallens' });
    expect(r).toEqual({ label: 'SocialLens', href: '#projects' });
  });

  it('experience evidence resolves to company/role + #experience', () => {
    const r = resolveEvidence({ type: 'experience', id: 'infini-ai-intern' });
    expect(r?.label).toContain('InfiniAI');
    expect(r?.href).toBe('#experience');
  });

  it('publication evidence resolves to publication label + #publications', () => {
    const r = resolveEvidence({ type: 'publication', id: 'ieee-cad-late-fusion-2025' });
    expect(r?.href).toBe('#publications');
    expect(r?.label).toBeTruthy();
  });

  it('leadership evidence resolves to organization + #leadership', () => {
    const r = resolveEvidence({ type: 'leadership', id: 'dsa-club-srm' });
    expect(r?.href).toBe('#leadership');
    expect(r?.label).toContain('DSA');
  });

  it('certification evidence resolves if exists, else null', () => {
    const r = resolveEvidence({ type: 'certification', id: 'nonexistent' });
    expect(r).toBeNull();
  });

  it('invalid id returns null predictably', () => {
    expect(resolveEvidence({ type: 'project', id: 'does-not-exist' })).toBeNull();
    expect(resolveEvidence({ type: 'experience', id: 'bad-id' })).toBeNull();
  });
});
