/**
 * Centralized Skills Data
 *
 * Single source of truth for all skill data across all visualization modes.
 * Add a skill here and it automatically appears in all 4 views:
 * - Constellation (radial chart)
 * - Timeline (chronological view)
 * - 3D Sphere (interactive 3D)
 * - Grid (card-based categories)
 */

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'databases'
  | 'cloud'
  | 'tools'
  | 'languages'
  | 'dataAnalytics'
  | 'aiTools';

export interface Skill {
  name: string;
  category: SkillCategory;
  description: string;
  relatedSkills: string[];
  yearStarted?: number;
  firstProject?: string;
  level?: number; // 0-100, used for legacy bar view
  tags?: string[];
}

export interface CategoryConfig {
  key: SkillCategory;
  icon: string;
  title: string;
  description: string;
  color: string; // Hex color for visualizations
  zone?: {
    startAngle: number;
    endAngle: number;
    innerRing?: boolean;
  };
}

/**
 * Category metadata for organizing and displaying skills
 * Intelligent sector distribution:
 * - Frontend: 0° to 45° (top to top-right)
 * - Backend: 45° to 90° (top-right to right)
 * - Databases: 90° to 135° (right to bottom-right)
 * - Cloud/DevOps: 135° to 180° (bottom-right to bottom)
 * - Languages: 180° to 225° (bottom to bottom-left) - inner ring
 * - Data Analytics: 225° to 270° (bottom-left to left)
 * - Tools: 270° to 315° (left to top-left) - inner ring
 * - AI/LLM: 315° to 360° (top-left to top)
 */
export const SKILL_CATEGORIES: CategoryConfig[] = [
  {
    key: 'frontend',
    icon: '⚛️',
    title: 'Frontend',
    description: 'Modern frameworks and libraries for creating responsive, interactive user interfaces.',
    color: '#00f0ff',
    zone: { startAngle: 0, endAngle: 45 },
  },
  {
    key: 'backend',
    icon: '⚙️',
    title: 'Backend',
    description: 'Server-side technologies for building APIs, microservices, and scalable architectures.',
    color: '#b026ff',
    zone: { startAngle: 45, endAngle: 90 },
  },
  {
    key: 'databases',
    icon: '🗄️',
    title: 'Databases',
    description: 'SQL and NoSQL databases, message queues, and distributed data processing systems.',
    color: '#ff006e',
    zone: { startAngle: 90, endAngle: 135 },
  },
  {
    key: 'cloud',
    icon: '☁️',
    title: 'Cloud/DevOps',
    description: 'Cloud platforms, containerization, and CI/CD tools for modern deployment workflows.',
    color: '#00d9ff',
    zone: { startAngle: 135, endAngle: 180 },
  },
  {
    key: 'languages',
    icon: '💻',
    title: 'Languages',
    description: 'Core programming languages for building robust, scalable applications across multiple domains.',
    color: '#7b2cbf',
    zone: { startAngle: 180, endAngle: 225, innerRing: true },
  },
  {
    key: 'dataAnalytics',
    icon: '📊',
    title: 'Data Analytics',
    description: 'Business intelligence, data warehousing, and analytics platforms for data-driven insights.',
    color: '#ff6b9d',
    zone: { startAngle: 225, endAngle: 270 },
  },
  {
    key: 'tools',
    icon: '🛠️',
    title: 'Tools',
    description: 'Essential tools for version control, testing, design, and development workflows.',
    color: '#ff1744',
    zone: { startAngle: 270, endAngle: 315, innerRing: true },
  },
  {
    key: 'aiTools',
    icon: '🤖',
    title: 'AI/LLM',
    description: 'Large language models and AI-powered development tools for enhanced productivity.',
    color: '#00ffaa',
    zone: { startAngle: 315, endAngle: 360 },
  },
];

/**
 * Complete skills dataset
 *
 * Each skill is automatically used by all visualization modes.
 * Properties:
 * - name: Display name
 * - category: Category for grouping and color coding
 * - description: Tagline or description for tooltips
 * - relatedSkills: Technologies commonly used together
 * - yearStarted: When you started using this skill (for timeline)
 * - firstProject: First project where you used this skill
 * - level: Proficiency level 0-100 (optional, for bar charts)
 * - tags: Additional tags for filtering (optional)
 */
export const SKILLS: Skill[] = [
  // Frontend Development
  {
    name: 'React',
    category: 'frontend',
    description: 'My go-to frontend framework for building interactive UIs',
    relatedSkills: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    yearStarted: 2020,
    firstProject: 'E-Commerce Platform',
    level: 95,
    tags: ['framework', 'ui', 'spa'],
  },
  {
    name: 'TypeScript',
    category: 'frontend',
    description: 'Type-safe development for robust applications',
    relatedSkills: ['React', 'Next.js', 'Node.js'],
    yearStarted: 2021,
    firstProject: 'Task Management App',
    level: 90,
    tags: ['language', 'types', 'javascript'],
  },
  {
    name: 'Next.js',
    category: 'frontend',
    description: 'Full-stack React framework with SSR and SSG',
    relatedSkills: ['React', 'TypeScript', 'Vercel'],
    yearStarted: 2022,
    firstProject: 'Portfolio Builder',
    level: 85,
    tags: ['framework', 'ssr', 'ssg'],
  },
  {
    name: 'Vue.js',
    category: 'frontend',
    description: 'Lightweight alternative for progressive web apps',
    relatedSkills: ['JavaScript', 'Tailwind CSS'],
    yearStarted: 2023,
    firstProject: 'Social Media Analytics',
    level: 75,
    tags: ['framework', 'ui'],
  },
  {
    name: 'Tailwind CSS',
    category: 'frontend',
    description: 'Rapid UI development with utility-first CSS',
    relatedSkills: ['React', 'Next.js', 'Vue.js'],
    yearStarted: 2021,
    firstProject: 'Task Management App',
    level: 95,
    tags: ['css', 'styling', 'utility'],
  },
  {
    name: 'HTML5',
    category: 'frontend',
    description: 'Foundation of the web',
    relatedSkills: ['CSS3', 'JavaScript'],
    yearStarted: 2018,
    firstProject: 'Personal Blog',
    level: 98,
    tags: ['markup', 'web'],
  },
  {
    name: 'CSS3',
    category: 'frontend',
    description: 'Styling maestro for beautiful interfaces',
    relatedSkills: ['HTML5', 'Tailwind CSS'],
    yearStarted: 2018,
    firstProject: 'Personal Blog',
    level: 95,
    tags: ['styling', 'web'],
  },
  {
    name: 'JavaScript',
    category: 'frontend',
    description: 'Core language for interactivity',
    relatedSkills: ['TypeScript', 'React', 'Node.js'],
    yearStarted: 2019,
    firstProject: 'Weather Dashboard',
    level: 92,
    tags: ['language', 'web'],
  },
  {
    name: 'Redux',
    category: 'frontend',
    description: 'State management for complex applications',
    relatedSkills: ['React', 'TypeScript'],
    yearStarted: 2020,
    firstProject: 'E-Commerce Platform',
    level: 85,
    tags: ['state', 'management'],
  },
  {
    name: 'WebSockets',
    category: 'frontend',
    description: 'Real-time bidirectional communication',
    relatedSkills: ['Node.js', 'Socket.io'],
    yearStarted: 2021,
    firstProject: 'Chat Application',
    level: 80,
    tags: ['realtime', 'communication'],
  },
  {
    name: 'Angular',
    category: 'frontend',
    description: 'Enterprise-grade TypeScript framework',
    relatedSkills: ['TypeScript', 'RxJS'],
    yearStarted: 2022,
    firstProject: 'Enterprise Dashboard',
    level: 70,
    tags: ['framework', 'enterprise'],
  },

  // Backend & Frameworks
  {
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript on the server',
    relatedSkills: ['Express.js', 'TypeScript', 'MongoDB', 'PostgreSQL'],
    yearStarted: 2020,
    firstProject: 'E-Commerce Platform',
    level: 88,
    tags: ['runtime', 'javascript'],
  },
  {
    name: 'Express.js',
    category: 'backend',
    description: 'Minimalist web framework for Node.js',
    relatedSkills: ['Node.js', 'MongoDB'],
    yearStarted: 2020,
    firstProject: 'Chat Application',
    level: 85,
    tags: ['framework', 'api'],
  },
  {
    name: 'Python',
    category: 'backend',
    description: 'Data & backend powerhouse',
    relatedSkills: ['Django', 'PostgreSQL', 'Data Modeling'],
    yearStarted: 2021,
    firstProject: 'Social Media Analytics',
    level: 80,
    tags: ['language', 'data'],
  },
  {
    name: 'Django',
    category: 'backend',
    description: 'Python web framework for perfectionists',
    relatedSkills: ['Python', 'PostgreSQL'],
    yearStarted: 2023,
    firstProject: 'Social Media Analytics',
    level: 75,
    tags: ['framework', 'python'],
  },
  {
    name: 'Java',
    category: 'backend',
    description: 'Enterprise-grade object-oriented language',
    relatedSkills: ['Spring Boot', 'PostgreSQL'],
    yearStarted: 2019,
    firstProject: 'Banking System',
    level: 85,
    tags: ['language', 'enterprise'],
  },
  {
    name: 'Spring Boot',
    category: 'backend',
    description: 'Java framework for microservices',
    relatedSkills: ['Java', 'Microservices'],
    yearStarted: 2020,
    firstProject: 'Banking System',
    level: 80,
    tags: ['framework', 'microservices'],
  },
  {
    name: 'GraphQL',
    category: 'backend',
    description: 'Modern API query language',
    relatedSkills: ['Node.js', 'Apollo'],
    yearStarted: 2023,
    firstProject: 'Portfolio Builder',
    level: 78,
    tags: ['api', 'query'],
  },
  {
    name: 'REST APIs',
    category: 'backend',
    description: 'API design standard',
    relatedSkills: ['Node.js', 'Express.js'],
    yearStarted: 2020,
    firstProject: 'E-Commerce Platform',
    level: 92,
    tags: ['api', 'architecture'],
  },
  {
    name: 'Microservices',
    category: 'backend',
    description: 'Distributed architecture pattern',
    relatedSkills: ['Docker', 'Kubernetes', 'Spring Boot'],
    yearStarted: 2022,
    firstProject: 'Enterprise Platform',
    level: 75,
    tags: ['architecture', 'distributed'],
  },
  {
    name: 'Ruby on Rails',
    category: 'backend',
    description: 'Convention-over-configuration web framework',
    relatedSkills: ['PostgreSQL', 'Redis'],
    yearStarted: 2021,
    firstProject: 'Startup MVP',
    level: 70,
    tags: ['framework', 'ruby'],
  },
  {
    name: 'GoLang',
    category: 'backend',
    description: 'High-performance concurrent systems',
    relatedSkills: ['Docker', 'Kubernetes'],
    yearStarted: 2023,
    firstProject: 'API Gateway',
    level: 65,
    tags: ['language', 'performance'],
  },

  // Databases & Data
  {
    name: 'PostgreSQL',
    category: 'databases',
    description: 'Relational database pro',
    relatedSkills: ['Node.js', 'Python', 'Django'],
    yearStarted: 2022,
    firstProject: 'Social Media Analytics',
    level: 82,
    tags: ['sql', 'relational'],
  },
  {
    name: 'MongoDB',
    category: 'databases',
    description: 'NoSQL database for flexible schemas',
    relatedSkills: ['Node.js', 'Express.js'],
    yearStarted: 2020,
    firstProject: 'E-Commerce Platform',
    level: 85,
    tags: ['nosql', 'document'],
  },
  {
    name: 'MySQL',
    category: 'databases',
    description: 'Popular open-source relational database',
    relatedSkills: ['PostgreSQL', 'PHP'],
    yearStarted: 2019,
    firstProject: 'School Management System',
    level: 80,
    tags: ['sql', 'relational'],
  },
  {
    name: 'Redis',
    category: 'databases',
    description: 'In-memory data structure store',
    relatedSkills: ['Node.js', 'Caching'],
    yearStarted: 2021,
    firstProject: 'Chat Application',
    level: 78,
    tags: ['cache', 'nosql'],
  },
  {
    name: 'Kafka',
    category: 'databases',
    description: 'Distributed event streaming platform',
    relatedSkills: ['Microservices', 'Spark'],
    yearStarted: 2022,
    firstProject: 'Event-Driven System',
    level: 70,
    tags: ['streaming', 'queue'],
  },
  {
    name: 'Spark',
    category: 'databases',
    description: 'Big data processing engine',
    relatedSkills: ['Python', 'Kafka'],
    yearStarted: 2023,
    firstProject: 'Data Pipeline',
    level: 65,
    tags: ['bigdata', 'processing'],
  },

  // Cloud & DevOps
  {
    name: 'AWS',
    category: 'cloud',
    description: 'Cloud infrastructure services',
    relatedSkills: ['Docker', 'Kubernetes', 'Terraform'],
    yearStarted: 2023,
    firstProject: 'E-Commerce Platform',
    level: 75,
    tags: ['cloud', 'infrastructure'],
  },
  {
    name: 'GCP',
    category: 'cloud',
    description: 'Google Cloud Platform',
    relatedSkills: ['Kubernetes', 'BigQuery'],
    yearStarted: 2023,
    firstProject: 'Analytics Platform',
    level: 70,
    tags: ['cloud', 'google'],
  },
  {
    name: 'Azure',
    category: 'cloud',
    description: 'Microsoft cloud services',
    relatedSkills: ['Docker', 'CI/CD'],
    yearStarted: 2022,
    firstProject: 'Enterprise App',
    level: 68,
    tags: ['cloud', 'microsoft'],
  },
  {
    name: 'Docker',
    category: 'cloud',
    description: 'Containerization platform',
    relatedSkills: ['Kubernetes', 'AWS', 'CI/CD'],
    yearStarted: 2022,
    firstProject: 'Social Media Analytics',
    level: 80,
    tags: ['container', 'devops'],
  },
  {
    name: 'Kubernetes',
    category: 'cloud',
    description: 'Container orchestration system',
    relatedSkills: ['Docker', 'AWS', 'Microservices'],
    yearStarted: 2023,
    firstProject: 'Microservices Platform',
    level: 72,
    tags: ['orchestration', 'devops'],
  },
  {
    name: 'Terraform',
    category: 'cloud',
    description: 'Infrastructure as Code',
    relatedSkills: ['AWS', 'GCP'],
    yearStarted: 2023,
    firstProject: 'Cloud Infrastructure',
    level: 68,
    tags: ['iac', 'automation'],
  },
  {
    name: 'CI/CD',
    category: 'cloud',
    description: 'Continuous Integration/Deployment pipelines',
    relatedSkills: ['Docker', 'Git', 'Jenkins'],
    yearStarted: 2022,
    firstProject: 'Automated Deployment',
    level: 80,
    tags: ['automation', 'pipeline'],
  },

  // Development Tools
  {
    name: 'Git',
    category: 'tools',
    description: 'Version control essential',
    relatedSkills: ['GitHub Copilot', 'VS Code', 'CI/CD'],
    yearStarted: 2019,
    firstProject: 'All Projects',
    level: 95,
    tags: ['vcs', 'collaboration'],
  },
  {
    name: 'Jest',
    category: 'tools',
    description: 'Testing framework for JavaScript',
    relatedSkills: ['React', 'TypeScript'],
    yearStarted: 2022,
    firstProject: 'Chat Application',
    level: 82,
    tags: ['testing', 'unit'],
  },
  {
    name: 'Cypress',
    category: 'tools',
    description: 'End-to-end testing framework',
    relatedSkills: ['React', 'TypeScript'],
    yearStarted: 2022,
    firstProject: 'E-Commerce Platform',
    level: 75,
    tags: ['testing', 'e2e'],
  },
  {
    name: 'Figma',
    category: 'tools',
    description: 'Design collaboration platform',
    relatedSkills: ['UI/UX', 'Prototyping'],
    yearStarted: 2021,
    firstProject: 'E-Commerce Platform',
    level: 85,
    tags: ['design', 'collaboration'],
  },
  {
    name: 'VS Code',
    category: 'tools',
    description: 'Daily code editor',
    relatedSkills: ['Git', 'GitHub Copilot'],
    yearStarted: 2019,
    firstProject: 'All Projects',
    level: 98,
    tags: ['editor', 'ide'],
  },
  {
    name: 'Vercel',
    category: 'tools',
    description: 'Deployment made easy for frontend',
    relatedSkills: ['Next.js', 'React'],
    yearStarted: 2022,
    firstProject: 'Portfolio Builder',
    level: 90,
    tags: ['deployment', 'hosting'],
  },
  {
    name: 'Firebase',
    category: 'tools',
    description: 'Real-time backend as a service',
    relatedSkills: ['React', 'Authentication'],
    yearStarted: 2021,
    firstProject: 'Task Management App',
    level: 85,
    tags: ['baas', 'realtime'],
  },

  // Programming Languages
  {
    name: 'C++',
    category: 'languages',
    description: 'Systems programming language',
    relatedSkills: ['Embedded C', 'Data Structures'],
    yearStarted: 2018,
    firstProject: 'University Projects',
    level: 82,
    tags: ['compiled', 'systems'],
  },
  {
    name: 'Smalltalk',
    category: 'languages',
    description: 'Object-oriented programming pioneer',
    relatedSkills: ['OOP Concepts'],
    yearStarted: 2019,
    firstProject: 'Academic Research',
    level: 60,
    tags: ['academic', 'oop'],
  },
  {
    name: 'Embedded C',
    category: 'languages',
    description: 'Programming for embedded systems',
    relatedSkills: ['C++', 'Hardware'],
    yearStarted: 2020,
    firstProject: 'IoT Device',
    level: 70,
    tags: ['embedded', 'hardware'],
  },

  // Data Analytics
  {
    name: 'Snowflake',
    category: 'dataAnalytics',
    description: 'Cloud data warehouse platform',
    relatedSkills: ['SQL', 'ETL Pipelines'],
    yearStarted: 2023,
    firstProject: 'Data Warehouse',
    level: 72,
    tags: ['warehouse', 'cloud'],
  },
  {
    name: 'Tableau',
    category: 'dataAnalytics',
    description: 'Business intelligence and visualization',
    relatedSkills: ['Data Modeling', 'SQL'],
    yearStarted: 2022,
    firstProject: 'Analytics Dashboard',
    level: 78,
    tags: ['visualization', 'bi'],
  },
  {
    name: 'BigQuery',
    category: 'dataAnalytics',
    description: 'Google Cloud data warehouse',
    relatedSkills: ['GCP', 'SQL'],
    yearStarted: 2023,
    firstProject: 'Analytics Platform',
    level: 70,
    tags: ['warehouse', 'gcp'],
  },
  {
    name: 'ETL Pipelines',
    category: 'dataAnalytics',
    description: 'Extract, Transform, Load data workflows',
    relatedSkills: ['Python', 'Snowflake'],
    yearStarted: 2022,
    firstProject: 'Data Pipeline',
    level: 75,
    tags: ['pipeline', 'data'],
  },
  {
    name: 'Data Modeling',
    category: 'dataAnalytics',
    description: 'Designing data structures and schemas',
    relatedSkills: ['PostgreSQL', 'Snowflake'],
    yearStarted: 2022,
    firstProject: 'Database Design',
    level: 80,
    tags: ['modeling', 'design'],
  },

  // AI/LLM Tools
  {
    name: 'ChatGPT',
    category: 'aiTools',
    description: 'AI assistant for coding and problem-solving',
    relatedSkills: ['Claude', 'Prompt Engineering'],
    yearStarted: 2023,
    firstProject: 'AI Integration',
    level: 85,
    tags: ['ai', 'llm'],
  },
  {
    name: 'Claude',
    category: 'aiTools',
    description: 'Advanced AI for development assistance',
    relatedSkills: ['ChatGPT', 'Prompt Engineering'],
    yearStarted: 2024,
    firstProject: 'This Portfolio',
    level: 90,
    tags: ['ai', 'llm'],
  },
  {
    name: 'GitHub Copilot',
    category: 'aiTools',
    description: 'AI pair programming assistant',
    relatedSkills: ['VS Code', 'Git'],
    yearStarted: 2023,
    firstProject: 'All Recent Projects',
    level: 88,
    tags: ['ai', 'coding'],
  },
  {
    name: 'Cursor',
    category: 'aiTools',
    description: 'AI-powered code editor',
    relatedSkills: ['VS Code', 'Claude'],
    yearStarted: 2024,
    firstProject: 'Modern Projects',
    level: 82,
    tags: ['ai', 'editor'],
  },
];

/**
 * Helper functions for working with skills data
 */

// Get all skills in a specific category
export const getSkillsByCategory = (category: SkillCategory): Skill[] => {
  return SKILLS.filter(skill => skill.category === category);
};

// Get category configuration
export const getCategoryConfig = (category: SkillCategory): CategoryConfig | undefined => {
  return SKILL_CATEGORIES.find(cat => cat.key === category);
};

// Get skills sorted by year started (for timeline)
export const getSkillsByYear = (): Skill[] => {
  return [...SKILLS]
    .filter(skill => skill.yearStarted)
    .sort((a, b) => (a.yearStarted || 0) - (b.yearStarted || 0));
};

// Get all unique years
export const getUniqueYears = (): number[] => {
  const years = SKILLS
    .filter(skill => skill.yearStarted)
    .map(skill => skill.yearStarted as number);
  return [...new Set(years)].sort();
};

// Group skills by category for grid view
export const getSkillsGroupedByCategory = (): Record<SkillCategory, Skill[]> => {
  const grouped = {} as Record<SkillCategory, Skill[]>;

  SKILL_CATEGORIES.forEach(cat => {
    grouped[cat.key] = getSkillsByCategory(cat.key);
  });

  return grouped;
};
