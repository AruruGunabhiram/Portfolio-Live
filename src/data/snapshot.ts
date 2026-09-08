/**
 * Public-only portfolio snapshot for future Ask Guna / recruiter mode.
 * Contains no private secrets; everything here is already rendered publicly.
 * Phone is intentionally included because it is presently rendered in Contact section
 * (per 2Z — preserve current privacy behavior). If privacy tightens later, remove
 * phone from this snapshot without touching canonical CONTACT.
 */

import { PROFILE } from './profile';
import { CONTACT } from './contact';
import { EXPERIENCE } from './experience';
import { PROJECTS } from './projects';
import { EDUCATION } from './education';
import { PUBLICATIONS } from './publications';
import { LEADERSHIP } from './leadership';
import { CERTIFICATIONS } from './certifications';
import { SKILLS } from './skills';

export function getPublicPortfolioSnapshot() {
  return {
    profile: PROFILE,
    contact: {
      email: CONTACT.email,
      linkedin: CONTACT.linkedin,
      linkedinUrl: CONTACT.linkedinUrl,
      github: CONTACT.github,
      githubUrl: CONTACT.githubUrl,
      resumeUrl: CONTACT.resumeUrl,
      // phone intentionally excluded from Ask Guna context per 14H — only email/GitHub/LinkedIn/resume are portfolio contact knowledge
    },
    experience: EXPERIENCE,
    projects: PROJECTS.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      summary: p.summary,
      categories: p.categories,
      technologies: p.technologies,
      featured: p.featured,
      highlights: p.highlights,
      links: p.links,
      caseStudy: p.caseStudy ? { oneLiner: p.caseStudy.oneLiner, headings: p.caseStudy.sections.map(s => s.heading) } : undefined,
    })),
    education: EDUCATION,
    publications: PUBLICATIONS,
    leadership: LEADERSHIP,
    // Projected from canonical CERTIFICATIONS. Only the publicly rendered credential
    // facts are exposed; `summary` (issue/expiry prose) and anything printed on the
    // certificate PDF but never published here (score, validation number, exam code)
    // stay out of Ask Guna context.
    certifications: CERTIFICATIONS.map(c => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      year: c.year,
      credentialUrl: c.credentialUrl,
      verificationUrl: c.verificationUrl,
    })),
    skills: SKILLS.map(s => ({ id: s.id, name: s.name, category: s.category })),
  };
}
