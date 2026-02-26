// Single source of truth for all resume content.
// Every section component renders by mapping over this data.

export interface ContactInfo {
  name: string;
  nameShort: string;
  phone: string;
  email: string;
  linkedin: string;
  linkedinUrl: string;
  github: string;
  githubUrl: string;
  headline: string;
  valueProposition: string;
}

export interface ImpactHighlight {
  metric: string;
  label: string;
}

export interface EducationEntry {
  id: number;
  school: string;
  degree: string;
  gpa: string;
  period: string;
  location: string;
}

export interface ExperienceEntry {
  id: number;
  company: string;
  role: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface ProjectEntry {
  id: number;
  title: string;
  subtitle: string;
  techStack: string[];
  bullets: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface SkillCategory {
  id: number;
  category: string;
  skills: string[];
}

export interface Publication {
  id: number;
  title: string;
  venue: string;
  year: number;
  highlights: string[];
}

// ─────────────────────────────────────────────────────────────────────────────

export const CONTACT: ContactInfo = {
  name: 'Gunabhiram Aruru',
  nameShort: 'Guna',
  phone: '+1 720-314-6492',
  email: 'gunabhiram.a@gmail.com',
  linkedin: 'linkedin.com/in/gunabhiram-aruru',
  linkedinUrl: 'https://www.linkedin.com/in/gunabhiram-aruru/',
  github: 'github.com/AruruGunabhiram',
  githubUrl: 'https://github.com/AruruGunabhiram',
  headline: 'Software Engineer — Backend & Full-Stack Systems',
  valueProposition:
    'Building production-grade backend systems with Java, Python, and cloud infrastructure. MS CS candidate at CU Boulder.',
};

export const IMPACT_HIGHLIGHTS: ImpactHighlight[] = [
  { metric: '30%', label: 'faster processing' },
  { metric: '25%', label: 'reliability lift' },
  { metric: '94%', label: 'accuracy (IEEE)' },
  { metric: '20%', label: 'faster delivery' },
];

// Professional tech stack chips shown in hero (replaces metric pills)
export const TECH_CHIPS: string[] = [
  'Java',
  'Spring Boot',
  'Python',
  'PostgreSQL',
  'REST APIs',
  'OAuth 2.0',
  'LLM Integration',
  'Docker',
];

export const EDUCATION: EducationEntry[] = [
  {
    id: 1,
    school: 'University of Colorado Boulder',
    degree: 'MS Computer Science',
    gpa: '3.65 / 4.0',
    period: 'Aug 2025 – May 2027',
    location: 'Boulder, CO',
  },
  {
    id: 2,
    school: 'SRM University',
    degree: 'BS Computer Science',
    gpa: '3.92 / 4.0',
    period: 'Aug 2021 – May 2025',
    location: 'Chennai, India',
  },
];

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 1,
    company: 'InfiniAI Technologies Pvt. Ltd.',
    role: 'Software Engineer Intern',
    location: 'Hyderabad, India',
    period: 'Sep 2024 – Nov 2024',
    bullets: [
      'Built Python automation pipelines that reduced processing time by 30% and improved system reliability',
      'Designed RESTful backend APIs that lifted service reliability by 25%',
      'Collaborated on 3 AI-driven production projects, accelerating delivery timelines by 20%',
      'Built and deployed full-stack company website (Flask backend), improving accessibility by 20%',
    ],
  },
];

export const PROJECTS: ProjectEntry[] = [
  {
    id: 1,
    title: 'SocialLens',
    subtitle: 'Creator Analytics & Intelligence Platform',
    techStack: ['Java', 'Spring Boot', 'PostgreSQL', 'OAuth 2.0', 'REST APIs'],
    bullets: [
      'Modular Spring Boot backend for ingest, persist, and serve of YouTube analytics — clear separation across OAuth, ingestion, scheduling, and analytics layers',
      'OAuth 2.0 auth + token refresh with secure persistence; maintains reliable access under quota and token expiry constraints',
      'Scheduled jobs for daily channel/video metric refresh with idempotent writes and snapshot uniqueness',
      'Normalized PostgreSQL schema for channel/video/time-series snapshots enabling historical trend analysis',
      'REST APIs for analytics and debugging with structured logging and input validation',
    ],
    githubUrl: 'https://github.com/AruruGunabhiram',
  },
  {
    id: 2,
    title: 'Creator Copilot',
    subtitle: 'Analytics-Driven Intelligence Layer',
    techStack: ['Java', 'Spring Boot', 'LLM APIs', 'REST', 'PostgreSQL'],
    bullets: [
      'Intelligence layer translating stored creator analytics into grounded, metrics-backed recommendations',
      'Analyzed retention, engagement, and publishing patterns; generated structured insights rather than generic tips',
      'REST interfaces serving explainable recommendations with supporting metrics and reasoning traces',
      'Guardrails to constrain LLM responses strictly to analytics-backed signals — preventing hallucinated advice',
    ],
    githubUrl: 'https://github.com/AruruGunabhiram',
  },
  {
    id: 3,
    title: 'Zenco',
    subtitle: 'Modular Developer Tooling System',
    techStack: ['Python', 'TypeScript', 'OOP', 'Design Patterns', 'VS Code API'],
    bullets: [
      'Plugin-style architecture with clean separation of analysis, transformation, and execution workflows',
      'Strategy + Factory patterns enabling swappable analysis/transformation engines without touching core logic',
      'Python CLI engine with VS Code extension integration for editor-native developer workflows',
    ],
    githubUrl: 'https://github.com/AruruGunabhiram',
  },
];

export const SKILLS: SkillCategory[] = [
  {
    id: 1,
    category: 'Programming Languages',
    skills: ['Python', 'Java', 'C/C++', 'JavaScript', 'SQL'],
  },
  {
    id: 2,
    category: 'Backend & Systems',
    skills: ['Spring Boot', 'REST APIs', 'OAuth 2.0', 'Scheduled Jobs', 'Data Pipelines', 'Flask', 'Django', 'Node.js', 'Express'],
  },
  {
    id: 3,
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'HTML', 'CSS', 'Bootstrap'],
  },
  {
    id: 4,
    category: 'Databases',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'AWS Aurora'],
  },
  {
    id: 5,
    category: 'Applied AI (Backend)',
    skills: ['LLM API Integration', 'Analytics-Grounded Prompting', 'Explainable AI', 'Hallucination Guardrails'],
  },
  {
    id: 6,
    category: 'Software Design',
    skills: ['OOP', 'Design Patterns (Strategy, Factory)', 'Modular Architecture', 'DSA'],
  },
  {
    id: 7,
    category: 'DevOps & Tools',
    skills: ['Docker', 'AWS', 'Git', 'GitHub Actions', 'CI/CD', 'Makefile', 'VS Code API'],
  },
];

export const PUBLICATIONS: Publication[] = [
  {
    id: 1,
    title: 'Computer-Aided Lung Cancer Diagnosis Using Deep Learning',
    venue: 'IEEE Conference',
    year: 2025,
    highlights: [
      'CNN diagnostic system using transfer learning on lung CT scans',
      '94% classification accuracy with Grad-CAM visual explainability',
    ],
  },
];
