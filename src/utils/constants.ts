export const PROJECTS = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with cart management, payment integration, and admin dashboard.',
    image: '/projects/ecommerce.jpg',
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    githubUrl: 'https://github.com/yourusername/ecommerce',
    liveUrl: 'https://ecommerce-demo.com',
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates and team features.',
    image: '/projects/taskmanager.jpg',
    techStack: ['TypeScript', 'React', 'Firebase', 'Tailwind'],
    githubUrl: 'https://github.com/yourusername/taskmanager',
    liveUrl: 'https://taskmanager-demo.com',
  },
  {
    id: 3,
    title: 'Weather Dashboard',
    description: 'Beautiful weather dashboard with forecasts, maps, and location-based recommendations.',
    image: '/projects/weather.jpg',
    techStack: ['React', 'OpenWeather API', 'Chart.js', 'CSS'],
    githubUrl: 'https://github.com/yourusername/weather',
    liveUrl: 'https://weather-demo.com',
  },
  {
    id: 4,
    title: 'Social Media Analytics',
    description: 'Analytics dashboard for tracking social media metrics and engagement across platforms.',
    image: '/projects/analytics.jpg',
    techStack: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
    githubUrl: 'https://github.com/yourusername/analytics',
    liveUrl: 'https://analytics-demo.com',
  },
  {
    id: 5,
    title: 'Portfolio Builder',
    description: 'Drag-and-drop portfolio builder with customizable templates and export options.',
    image: '/projects/portfolio.jpg',
    techStack: ['Next.js', 'Prisma', 'TailwindCSS', 'Vercel'],
    githubUrl: 'https://github.com/yourusername/portfolio-builder',
    liveUrl: 'https://portfolio-builder-demo.com',
  },
  {
    id: 6,
    title: 'Chat Application',
    description: 'Real-time chat application with channels, direct messages, and file sharing.',
    image: '/projects/chat.jpg',
    techStack: ['React', 'Socket.io', 'Express', 'Redis'],
    githubUrl: 'https://github.com/yourusername/chat',
    liveUrl: 'https://chat-demo.com',
  },
];

export const SOCIAL_LINKS = {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  email: 'your.email@example.com',
};

/**
 * SKILLS DATA MOVED TO CENTRALIZED SOURCE
 *
 * All skills data now lives in /src/data/skills.ts for consistency across views.
 * This ensures when you add a skill to the centralized data file, it automatically
 * appears in all 4 visualization modes (Constellation, Timeline, 3D Sphere, Grid).
 *
 * Import skills data directly from:
 * import { SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../data/skills';
 */
