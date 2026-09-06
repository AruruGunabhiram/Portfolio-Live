/**
 * @deprecated — Canonical data now lives in src/data/{profile,contact,experience,projects,education,publications,leadership,skills,practices}
 * and types in src/types/portfolio.ts. This file remains only as a compatibility shim
 * for any unmigrated imports and will be removed after Phase 2 verification.
 * Do not add new content here.
 */

export { PROFILE as CONTACT_PROFILE } from './profile';
export { CONTACT } from './contact';
export { IMPACT_HIGHLIGHTS, TECH_CHIPS } from './profile';
export { EDUCATION } from './education';
export { EXPERIENCE } from './experience';
export { PROJECTS } from './projects';
export { PUBLICATIONS } from './publications';
export { LEADERSHIP } from './leadership';
export { ENGINEERING_PRACTICES } from './practices';
export { SKILLS as SKILL_GROUPS, SKILLS } from './skills';

// Legacy type aliases for any remaining importers
export type { ContactInfo } from '../types/portfolio';
export type { ExperienceEntry } from '../types/portfolio';
export type { Project as ProjectEntry } from '../types/portfolio';
export type { EducationEntry } from '../types/portfolio';
export type { Publication } from '../types/portfolio';
export type { LeadershipEntry } from '../types/portfolio';
