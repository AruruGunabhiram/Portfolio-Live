import type { ExperienceEntry } from '../types/portfolio';

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'projxon-ai-intern',
    company: 'PROJXON',
    companyShort: 'PROJXON',
    role: 'AI Intern',
    location: 'Remote',
    period: 'Present',
    bullets: [
      'Contributing to OrkaATS — operational and recruiting workflow software built around structured workflows and supporting tooling.',
      'Building bounded AI and agent workflows and automation systems with explicit permission checks and approval gates.',
      'Developing controlled AI-assisted workflows with separation between context and reasoning, proposal generation, human approval, application-owned execution, and auditability.',
    ],
  },
  {
    id: 'infini-ai-intern',
    company: 'InfiniAI Technologies Pvt. Ltd.',
    companyShort: 'InfiniAI Technologies',
    role: 'Software Engineer Intern',
    techLabel: 'Python',
    location: 'Hyderabad, India',
    period: 'Sep 2024 – Nov 2024',
    bullets: [
      'Built Python automation pipelines that reduced processing time and improved operational throughput.',
      'Developed backend API improvements focused on reliability and cleaner service behavior.',
      'Collaborated across 3 AI-driven projects and delivered features faster through tighter execution.',
      'Built and deployed a Flask-based company website backend and improved overall accessibility.',
    ],
    technologies: ['Python', 'Flask'],
  },
];
