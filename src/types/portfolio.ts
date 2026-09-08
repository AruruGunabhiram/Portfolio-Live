/**
 * Canonical portfolio content types.
 * Single source for all entities — no duplicate interfaces across data files.
 */

// ─── Profile / Contact ──────────────────────────────────────

export interface Profile {
  name: string;
  shortName: string;
  headline: string;
  valueProposition: string;
  location?: string;
  availability?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  linkedinUrl: string;
  github: string;
  githubUrl: string;
  resumeUrl: string;
}

// ─── Experience ─────────────────────────────────────────────

export interface ExperienceEntry {
  id: string;
  company: string;
  companyShort?: string;
  role: string;
  techLabel?: string;
  location: string;
  period: string;
  bullets: string[];
  technologies?: string[];
  highlights?: string[];
}

// ─── Project ────────────────────────────────────────────────

export type ProjectCategory =
  | 'backend'
  | 'full-stack'
  | 'ai'
  | 'developer-tools'
  | 'desktop'
  | 'browser-extension';

export type ProjectStatus = 'active' | 'completed' | 'in-progress' | 'archived';

/** Attribution for a project. Absent means unstated — never assume solo. */
export type ProjectContribution = 'solo' | 'co-built' | 'contributor';

export interface ProjectLinks {
  github?: string;
  live?: string;
  paper?: string;
  documentation?: string;
}

export interface CaseStudySection {
  heading: string;
  content?: string;
  bullets?: string[];
}

export interface CaseStudy {
  oneLiner: string;
  sections: CaseStudySection[];
}

export type DemoType = 'flow' | 'video' | 'lottie' | 'interactive' | 'none';

// ─── Phase 7 — declarative flow / media demos ─────────────────

export interface FlowDemoStep {
  id: string;
  label: string;
  detail?: string;
  state?: 'default' | 'success' | 'warning';
}

export interface FlowDemo {
  type: 'flow';
  steps: FlowDemoStep[];
  connections?: { from: string; to: string }[];
  durationMs?: number;
  ariaLabel?: string;
}

export interface MediaDemo {
  type: 'media';
  src: string;
  poster?: string;
  alt: string;
  durationMs?: number;
  ariaLabel?: string;
}

export type ProjectDemo = FlowDemo | MediaDemo;

export interface ProjectArchitecture {
  summary?: string;
  asset?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  categories: ProjectCategory[];
  technologies: string[];
  featured: boolean;
  featuredOrder?: number;
  contribution?: ProjectContribution;
  status?: ProjectStatus;
  year?: number;
  highlights: string[];
  links: ProjectLinks;
  caseStudy?: CaseStudy;
  architecture?: ProjectArchitecture;
  demo?: ProjectDemo;
}

// ─── Education ──────────────────────────────────────────────

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  gpa: string;
  period: string;
  location: string;
}

// ─── Publication ────────────────────────────────────────────

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  highlights: string[];
  paperUrl?: string;
}

// ─── Certification ──────────────────────────────────────────

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year?: number;
  /** Local proof artifact (the certificate PDF served from public/). */
  credentialUrl?: string;
  /** Issuer-hosted verification page for this specific credential. */
  verificationUrl?: string;
  summary?: string;
}

// ─── Skills ─────────────────────────────────────────────────

export type SkillCategory =
  | 'languages'
  | 'backend'
  | 'frontend'
  | 'databases'
  | 'ai'
  | 'design'
  | 'devops';

export interface SkillCategoryMeta {
  id: SkillCategory;
  label: string;
  description: string;
}

export type SkillEvidenceType = 'project' | 'experience' | 'publication' | 'certification' | 'leadership';

export interface SkillEvidence {
  type: SkillEvidenceType;
  id: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  evidence?: SkillEvidence[];
}

// ─── Leadership ─────────────────────────────────────────────

export interface LeadershipEntry {
  id: string;
  organization: string;
  role: string;
  period?: string;
  description: string;
}

// ─── Shared ─────────────────────────────────────────────────

export interface ImpactHighlight {
  metric: string;
  label: string;
}

export interface EngineeringPractice {
  label: string;
  description: string;
}
