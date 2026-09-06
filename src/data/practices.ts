import type { EngineeringPractice } from '../types/portfolio';

export const ENGINEERING_PRACTICES: EngineeringPractice[] = [
  {
    label: 'Architecture',
    description: 'Feature-based structure, clear separation of concerns (auth, ingestion, scheduling, analytics).',
  },
  {
    label: 'API contracts',
    description: 'Typed request/response models, input validation, consistent error responses.',
  },
  {
    label: 'Reliability',
    description: 'Idempotent writes for scheduled refresh jobs; safe retries and failure handling.',
  },
  {
    label: 'Observability',
    description: 'Structured logs with context (channel/video IDs), predictable debug endpoints for tracing issues.',
  },
  {
    label: 'Performance',
    description: 'Pagination + caching patterns for read APIs; avoids redundant computation and DB writes.',
  },
  {
    label: 'Security basics',
    description: 'Secure token handling, least-privilege mindset for API access, avoids hard-coding secrets.',
  },
  {
    label: 'Developer workflow',
    description: 'Git discipline, meaningful commits, clean PRs, consistent formatting/linting.',
  },
  {
    label: 'Quality mindset',
    description: 'Focus on edge cases, graceful fallbacks, and predictable behavior under failure.',
  },
];
