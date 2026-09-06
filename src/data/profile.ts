import type { Profile, ImpactHighlight } from '../types/portfolio';

export const PROFILE: Profile = {
  name: 'Gunabhiram Aruru',
  shortName: 'Guna',
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

export const TECH_CHIPS: string[] = [
  'Backend Systems',
  'Distributed Systems',
  'OAuth 2.0 + Token Refresh',
  'Scheduled Jobs + Idempotency',
  'REST APIs + Validation',
  'PostgreSQL Schema Design',
  'LLM Guardrails',
  'Data Pipelines',
];
