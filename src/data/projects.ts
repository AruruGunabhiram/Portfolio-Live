import type { Project } from '../types/portfolio';

export const PROJECTS: Project[] = [
  {
    id: 'sociallens',
    slug: 'sociallens',
    title: 'SocialLens',
    subtitle: 'Creator Analytics & Intelligence Platform',
    summary:
      'A production-style analytics backend that ingests YouTube metrics, stores time-series snapshots, and serves clean APIs for dashboards and insights.',
    categories: ['backend'],
    technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'OAuth 2.0', 'REST APIs'],
    featured: true,
    featuredOrder: 1,
    highlights: [
      'Modular Spring Boot backend for ingest, persist, and serve of YouTube analytics — clear separation across OAuth, ingestion, scheduling, and analytics layers',
      'OAuth 2.0 auth + token refresh with secure persistence; maintains reliable access under quota and token expiry constraints',
      'Scheduled jobs for daily channel/video metric refresh with idempotent writes and snapshot uniqueness',
      'Normalized PostgreSQL schema for channel/video/time-series snapshots enabling historical trend analysis',
      'REST APIs for analytics and debugging with structured logging and input validation',
    ],
    links: {
      github: 'https://github.com/AruruGunabhiram/SocialLens',
    },
    caseStudy: {
      oneLiner:
        'A production-style analytics backend that ingests YouTube metrics, stores time-series snapshots, and serves clean APIs for dashboards and insights.',
      sections: [
        {
          heading: 'Problem',
          content:
            'Creators need a consistent, historical view of performance, but analytics data is rate-limited, token-gated, and changes over time. I built a system that reliably refreshes metrics daily and preserves snapshots for analysis.',
        },
        {
          heading: 'Constraints I handled',
          bullets: [
            'OAuth 2.0 tokens expire → requires refresh + secure persistence',
            'API quotas and partial failures → must fail gracefully and retry safely',
            'Time-series data → requires snapshot uniqueness and idempotent updates',
          ],
        },
        {
          heading: 'Architecture',
          content:
            'Spring Boot services for OAuth, ingestion, scheduling, and analytics, backed by PostgreSQL with normalized entities for channels/videos and time-stamped metric snapshots.',
        },
        {
          heading: 'Key engineering decisions',
          bullets: [
            'Idempotent snapshot writes to prevent duplicates and keep refresh safe',
            'Clear module boundaries so analytics and ingestion evolve independently',
            'Structured logs to debug refresh failures and API responses quickly',
          ],
        },
        {
          heading: "What I'd build next",
          bullets: [
            'Add rate-limit aware backoff and job status dashboards',
            'Add integration tests for refresh workflows and snapshot correctness',
          ],
        },
      ],
    },
    architecture: {
      summary:
        'Spring Boot services for OAuth, ingestion, scheduling, and analytics, backed by PostgreSQL with normalized entities for channels/videos and time-stamped metric snapshots.',
    },
    demo: {
      type: 'flow',
      durationMs: 6400,
      ariaLabel: 'SocialLens processing flow: YouTube metrics via OAuth ingestion, scheduled idempotent refresh, PostgreSQL time-series store, and REST analytics APIs',
      steps: [
        { id: 'source', label: 'YouTube metrics', detail: 'Channel & video metrics via OAuth 2.0' },
        { id: 'ingest', label: 'Ingestion & scheduling', detail: 'Daily jobs with idempotent writes' },
        { id: 'store', label: 'PostgreSQL time-series store', detail: 'Normalized snapshots for history' },
        { id: 'api', label: 'REST analytics APIs', detail: 'Structured APIs for dashboards' },
      ],
    },
  },
  {
    id: 'creator-copilot',
    slug: 'creator-copilot',
    title: 'Creator Copilot',
    subtitle: 'Analytics-Driven Intelligence Layer',
    summary: 'Intelligence layer translating stored creator analytics into grounded, metrics-backed recommendations.',
    categories: ['ai', 'backend'],
    technologies: ['Java', 'Spring Boot', 'LLM APIs', 'REST', 'PostgreSQL'],
    featured: true,
    featuredOrder: 2,
    highlights: [
      'Intelligence layer translating stored creator analytics into grounded, metrics-backed recommendations',
      'Analyzed retention, engagement, and publishing patterns; generated structured insights rather than generic tips',
      'REST interfaces serving explainable recommendations with supporting metrics and reasoning traces',
      'Guardrails to constrain LLM responses strictly to analytics-backed signals — preventing hallucinated advice',
    ],
    links: {
      github: 'https://github.com/AruruGunabhiram',
    },
    demo: {
      type: 'flow',
      durationMs: 6400,
      ariaLabel: 'Creator Copilot flow: analytics context, prompt assembly, LLM call with guardrails, and explainable recommendation',
      steps: [
        { id: 'context', label: 'Analytics context', detail: 'Stored retention & engagement metrics' },
        { id: 'assemble', label: 'Prompt & context assembly', detail: 'Structured signals assembled for LLM' },
        { id: 'llm', label: 'LLM call with guardrails', detail: 'Constrained to analytics-backed signals' },
        { id: 'insight', label: 'Explainable recommendation', detail: 'Structured insight with reasoning traces' },
      ],
    },
  },
  {
    id: 'incidentpilot',
    slug: 'incidentpilot',
    title: 'IncidentPilot',
    subtitle: 'Approval-Gated Incident Investigator',
    summary:
      'An approval-gated incident investigation assistant that analyzes CI logs and repository snapshots, verifies file/line evidence, and blocks external actions until safety gates and human approval pass.',
    categories: ['ai', 'backend'],
    technologies: ['Python', 'FastAPI', 'Pydantic', 'Gemini API', 'Pytest'],
    featured: false,
    highlights: [
      'Sequential investigation workflow over CI logs, stack traces, and a local repository snapshot, producing structured root-cause, remediation, and regression-test reports',
      'Verifies cited file paths and line numbers before reporting them, so findings stay grounded in evidence that actually exists',
      'Sensitive-value redaction, path guards, deterministic safety gates, and recorded human approval before any external GitHub issue creation; dry-run is the default',
      'Deterministic investigation by default; optional Gemini agent mode receives only redacted, grounded evidence, and schema-invalid or ungrounded output falls back to the deterministic report',
      '438 passing tests and 8 of 8 evaluation cases meeting expected outcomes, including 2 deliberate safe failures',
      'Built for the Kaggle Agents for Business hackathon track',
    ],
    links: {
      github: 'https://github.com/AruruGunabhiram/IncidentPilot',
    },
  },
  {
    id: 'clinical-reconciliation',
    slug: 'clinical-reconciliation',
    title: 'Clinical Reconciliation',
    subtitle: 'Medication Review Platform',
    summary:
      'A full-stack medication reconciliation and data-quality review application with confidence scoring and an explicit human approve/reject step before any suggestion is accepted.',
    categories: ['full-stack', 'ai'],
    technologies: ['Python', 'FastAPI', 'React', 'Supabase', 'PostgreSQL', 'Docker'],
    featured: false,
    highlights: [
      'Reconciles conflicting medication records submitted from multiple source systems into a single suggested record with stated reasoning',
      'Scores patient-record data quality across completeness, accuracy, timeliness, and plausibility, surfacing specific issues with severity levels',
      'Every result carries a 0-1 confidence score, and no suggestion is accepted without an explicit human approve/reject decision persisted to Supabase',
      'API-key authentication on all backend routes, in-memory LRU caching so identical requests skip the model, and deterministic fallback plus error handling when the model path is unavailable',
      'Docker Compose for reproducible local deployment; frontend and backend deployed separately with a live demo application',
    ],
    links: {
      github: 'https://github.com/AruruGunabhiram/clinical-reconciliation',
      live: 'https://clinical-reconciliation.vercel.app',
    },
  },
  {
    id: 'zenco',
    slug: 'zenco',
    title: 'Zenco',
    subtitle: 'Modular Developer Tooling System',
    summary: 'Plugin-style architecture with clean separation of analysis, transformation, and execution workflows.',
    categories: ['developer-tools'],
    technologies: ['Python', 'TypeScript', 'OOP', 'Design Patterns', 'VS Code API'],
    featured: false,
    highlights: [
      'Plugin-style architecture with clean separation of analysis, transformation, and execution workflows',
      'Strategy + Factory patterns enabling swappable analysis/transformation engines without touching core logic',
      'Python CLI engine with VS Code extension integration for editor-native developer workflows',
    ],
    links: {
      github: 'https://github.com/paudelnirajan/zenco-vscode-extension',
    },
  },
  {
    id: 'code-battlegrounds',
    slug: 'code-battlegrounds',
    title: 'Code Battlegrounds',
    subtitle: 'Full-Stack Collaborative Coding Platform',
    summary: 'Real-time collaborative coding platform with live execution, OAuth, and AI-assisted learning.',
    categories: ['full-stack'],
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'Node.js',
      'Express',
      'Socket.IO',
      'Supabase',
      'PostgreSQL',
      'Judge0',
      'Gemini API',
      'ElevenLabs',
      'SCSS',
    ],
    featured: true,
    featuredOrder: 3,
    highlights: [
      'Real-time collaborative editor using Socket.IO with multi-user synchronization and conflict resolution',
      'Multi-language code execution through Judge0 API supporting immediate feedback and testing',
      'Google OAuth authentication with Supabase backend and PostgreSQL for secure data persistence',
      'AI-powered hints via Gemini API and voice integration through ElevenLabs for accessible learning',
      'Fullstack: React 19 + TypeScript frontend on Vite, Node.js/Express backend with structured APIs',
    ],
    links: {
      github: 'https://github.com/Kanyarasi2026/code-battle-grounds',
      live: 'https://code-battle-grounds.vercel.app',
    },
    demo: {
      type: 'flow',
      durationMs: 6400,
      ariaLabel: 'Code Battlegrounds flow: submit from collaborative editor, backend forwards to Judge0, execution, and realtime sync',
      steps: [
        { id: 'submit', label: 'Submit from editor', detail: 'From Socket.IO collaborative editor' },
        { id: 'request', label: 'Backend execution request', detail: 'Node/Express forwards to Judge0' },
        { id: 'execute', label: 'Judge0 execution', detail: 'Multi-language immediate feedback' },
        { id: 'sync', label: 'Realtime session sync', detail: 'Socket.IO broadcasts to participants' },
      ],
    },
  },
  {
    id: 'timesling',
    slug: 'timesling',
    title: 'TimeSling',
    subtitle: 'macOS Productivity App',
    summary: 'Native macOS menu bar utility for fast, stacked timer and session management.',
    categories: ['desktop'],
    technologies: ['Swift', 'SwiftUI', 'macOS'],
    featured: false,
    highlights: [
      'Native macOS menu bar utility designed for speed — launch preset timers and session-named tasks instantly',
      'Drag-based custom timer creation with support for stacking multiple simultaneous sessions',
      'Fullscreen-capable notifications that surface reminders above active applications',
      'Zero-dock design philosophy: lightweight UI optimized for repetitive timer use without visual clutter',
    ],
    links: {
      github: 'https://github.com/AruruGunabhiram/TimeSling-fresh',
    },
  },
  {
    id: 'nostalgia',
    slug: 'nostalgia',
    title: 'Nostalgia',
    subtitle: 'Browser Extension / Productivity Tool',
    summary: 'Browser extension for saving, organizing, and reusing copied text snippets.',
    categories: ['browser-extension'],
    technologies: ['React', 'TypeScript', 'SCSS', 'Chrome Extension APIs'],
    featured: false,
    highlights: [
      'Save, organize, and search copied text snippets with persistent local storage via chrome.storage.local',
      'Quick copy-paste reuse workflow eliminating repetitive clipboard searches and manual re-typing',
      'Clean popup and options-page interfaces for session-based snippet management and organization',
      'Lightweight productivity extension built for real clipboard workflow friction, not theoretical features',
    ],
    links: {
      github: 'https://github.com/Meghan31/nostalgia-copy-paste-extension',
    },
  },
];
