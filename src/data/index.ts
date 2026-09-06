/**
 * Canonical portfolio data barrel.
 * Import from here for consistent access; avoid deep relative chains.
 */

// types
export * from '../types/portfolio';

// canonical data
export { PROFILE, IMPACT_HIGHLIGHTS, TECH_CHIPS } from './profile';
export { CONTACT } from './contact';
export { EXPERIENCE } from './experience';
export { PROJECTS } from './projects';
export { EDUCATION } from './education';
export { PUBLICATIONS } from './publications';
export { CERTIFICATIONS } from './certifications';
export { LEADERSHIP } from './leadership';
export { SKILLS, SKILL_CATEGORIES } from './skills';
export { ENGINEERING_PRACTICES } from './practices';

// helpers for Ask Guna / recruiter mode — public-only surface
export { getPublicPortfolioSnapshot } from './snapshot';

// validation (dev-only)
export { validatePortfolio, validateSkillEvidence } from './validate';
