import type { Skill, SkillCategoryMeta } from '../types/portfolio';

export const SKILL_CATEGORIES: SkillCategoryMeta[] = [
  {
    id: 'languages',
    label: 'Languages',
    description: 'Core programming languages for building backend and full-stack systems.',
  },
  {
    id: 'backend',
    label: 'Backend & Systems',
    description: 'Server frameworks, APIs, and reliability patterns for production services.',
  },
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'Modern frameworks and fundamentals for responsive, type-safe interfaces.',
  },
  {
    id: 'databases',
    label: 'Databases',
    description: 'Relational and NoSQL systems and data modeling.',
  },
  {
    id: 'ai',
    label: 'Applied AI (Backend)',
    description: 'LLM integration with guardrails and explainability for grounded recommendations.',
  },
  {
    id: 'design',
    label: 'Software Design',
    description: 'Principles and patterns for modular, maintainable architectures.',
  },
  {
    id: 'devops',
    label: 'DevOps & Tools',
    description: 'Containerization, CI/CD, and developer workflow tooling.',
  },
];

export const SKILLS: Skill[] = [
  // languages
  { id: 'python', name: 'Python', category: 'languages', evidence: [{ type: 'experience', id: 'infini-ai-intern' }, { type: 'project', id: 'ember' }, { type: 'project', id: 'incidentpilot' }, { type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'java', name: 'Java', category: 'languages', evidence: [{ type: 'project', id: 'sociallens' }] },
  { id: 'cpp', name: 'C/C++', category: 'languages' },
  { id: 'javascript', name: 'JavaScript', category: 'languages', evidence: [{ type: 'project', id: 'code-battlegrounds' }] },
  { id: 'sql', name: 'SQL', category: 'languages', evidence: [{ type: 'project', id: 'sociallens' }] },

  // backend & systems
  { id: 'spring-boot', name: 'Spring Boot', category: 'backend', evidence: [{ type: 'project', id: 'sociallens' }] },
  { id: 'rest-apis', name: 'REST APIs', category: 'backend', evidence: [{ type: 'project', id: 'sociallens' }, { type: 'project', id: 'ember' }, { type: 'project', id: 'code-battlegrounds' }, { type: 'project', id: 'incidentpilot' }, { type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'oauth2', name: 'OAuth 2.0', category: 'backend', evidence: [{ type: 'project', id: 'sociallens' }, { type: 'project', id: 'code-battlegrounds' }] },
  { id: 'scheduled-jobs', name: 'Scheduled Jobs', category: 'backend', evidence: [{ type: 'project', id: 'sociallens' }] },
  { id: 'data-pipelines', name: 'Data Pipelines', category: 'backend', evidence: [{ type: 'project', id: 'sociallens' }] },
  { id: 'flask', name: 'Flask', category: 'backend', evidence: [{ type: 'experience', id: 'infini-ai-intern' }] },
  { id: 'django', name: 'Django', category: 'backend' },
  { id: 'nodejs', name: 'Node.js', category: 'backend', evidence: [{ type: 'project', id: 'code-battlegrounds' }] },
  { id: 'express', name: 'Express', category: 'backend', evidence: [{ type: 'project', id: 'code-battlegrounds' }] },

  // frontend
  { id: 'react', name: 'React', category: 'frontend', evidence: [{ type: 'project', id: 'code-battlegrounds' }, { type: 'project', id: 'nostalgia' }, { type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', evidence: [{ type: 'project', id: 'zenco' }, { type: 'project', id: 'code-battlegrounds' }, { type: 'project', id: 'nostalgia' }] },
  { id: 'html', name: 'HTML', category: 'frontend' },
  { id: 'css', name: 'CSS', category: 'frontend' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'frontend' },

  // databases
  { id: 'postgresql', name: 'PostgreSQL', category: 'databases', evidence: [{ type: 'project', id: 'sociallens' }, { type: 'project', id: 'code-battlegrounds' }, { type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'mysql', name: 'MySQL', category: 'databases' },
  { id: 'mongodb', name: 'MongoDB', category: 'databases' },
  { id: 'aws-aurora', name: 'AWS Aurora', category: 'databases' },

  // applied ai
  { id: 'llm-api-integration', name: 'LLM API Integration', category: 'ai', evidence: [{ type: 'project', id: 'ember' }, { type: 'project', id: 'code-battlegrounds' }, { type: 'project', id: 'incidentpilot' }, { type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'explainable-ai', name: 'Explainable AI', category: 'ai', evidence: [{ type: 'project', id: 'incidentpilot' }, { type: 'project', id: 'clinical-reconciliation' }, { type: 'publication', id: 'ieee-cad-late-fusion-2025' }] },
  { id: 'hallucination-guardrails', name: 'Hallucination Guardrails', category: 'ai', evidence: [{ type: 'project', id: 'ember' }, { type: 'project', id: 'incidentpilot' }, { type: 'project', id: 'clinical-reconciliation' }] },

  // design
  { id: 'oop', name: 'OOP', category: 'design', evidence: [{ type: 'project', id: 'zenco' }] },
  { id: 'design-patterns', name: 'Design Patterns (Strategy, Factory)', category: 'design' },
  { id: 'modular-architecture', name: 'Modular Architecture', category: 'design', evidence: [{ type: 'project', id: 'sociallens' }, { type: 'project', id: 'ember' }, { type: 'project', id: 'zenco' }] },
  { id: 'dsa', name: 'DSA', category: 'design', evidence: [{ type: 'leadership', id: 'dsa-club-srm' }] },

  // devops & tools
  { id: 'docker', name: 'Docker', category: 'devops', evidence: [{ type: 'project', id: 'clinical-reconciliation' }] },
  { id: 'aws', name: 'AWS', category: 'devops' },
  { id: 'git', name: 'Git', category: 'devops' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'devops' },
  { id: 'cicd', name: 'CI/CD', category: 'devops' },
  { id: 'makefile', name: 'Makefile', category: 'devops' },
  { id: 'vscode-api', name: 'VS Code API', category: 'devops', evidence: [{ type: 'project', id: 'zenco' }] },
];
