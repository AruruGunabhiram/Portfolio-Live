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

export const SKILLS = {
  frontend: [
    { name: 'HTML5', level: 98, year: 2018, tagline: 'Foundation of the web', firstProject: 'Personal Blog' },
    { name: 'CSS3', level: 95, year: 2018, tagline: 'Styling maestro', firstProject: 'Personal Blog' },
    { name: 'JavaScript', level: 92, year: 2019, tagline: 'Core language for interactivity', firstProject: 'Weather Dashboard' },
    { name: 'React', level: 95, year: 2020, tagline: 'My go-to frontend framework', firstProject: 'E-Commerce Platform' },
    { name: 'TypeScript', level: 90, year: 2021, tagline: 'Type-safe development', firstProject: 'Task Management App' },
    { name: 'Tailwind CSS', level: 95, year: 2021, tagline: 'Rapid UI development', firstProject: 'Task Management App' },
    { name: 'Next.js', level: 85, year: 2022, tagline: 'Full-stack React framework', firstProject: 'Portfolio Builder' },
    { name: 'Vue.js', level: 75, year: 2023, tagline: 'Lightweight alternative', firstProject: 'Social Media Analytics' },
  ],
  backend: [
    { name: 'Node.js', level: 88, year: 2020, tagline: 'JavaScript on the server', firstProject: 'E-Commerce Platform' },
    { name: 'Express', level: 85, year: 2020, tagline: 'Minimalist web framework', firstProject: 'Chat Application' },
    { name: 'MongoDB', level: 85, year: 2020, tagline: 'NoSQL database', firstProject: 'E-Commerce Platform' },
    { name: 'REST APIs', level: 92, year: 2020, tagline: 'API design standard', firstProject: 'E-Commerce Platform' },
    { name: 'Python', level: 80, year: 2021, tagline: 'Data & backend powerhouse', firstProject: 'Social Media Analytics' },
    { name: 'PostgreSQL', level: 82, year: 2022, tagline: 'Relational database pro', firstProject: 'Social Media Analytics' },
    { name: 'Django', level: 75, year: 2023, tagline: 'Python web framework', firstProject: 'Social Media Analytics' },
    { name: 'GraphQL', level: 78, year: 2023, tagline: 'Modern API query language', firstProject: 'Portfolio Builder' },
  ],
  tools: [
    { name: 'Git', level: 95, year: 2019, tagline: 'Version control essential', firstProject: 'All Projects' },
    { name: 'VS Code', level: 98, year: 2019, tagline: 'Daily code editor', firstProject: 'All Projects' },
    { name: 'Firebase', level: 85, year: 2021, tagline: 'Real-time backend', firstProject: 'Task Management App' },
    { name: 'Figma', level: 85, year: 2021, tagline: 'Design collaboration', firstProject: 'E-Commerce Platform' },
    { name: 'Jest', level: 82, year: 2022, tagline: 'Testing framework', firstProject: 'Chat Application' },
    { name: 'Docker', level: 80, year: 2022, tagline: 'Containerization platform', firstProject: 'Social Media Analytics' },
    { name: 'Vercel', level: 90, year: 2022, tagline: 'Deployment made easy', firstProject: 'Portfolio Builder' },
    { name: 'AWS', level: 75, year: 2023, tagline: 'Cloud infrastructure', firstProject: 'E-Commerce Platform' },
  ],
};

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
 * Import skills data from:
 * import { SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../data/skills';
 *
 * Legacy exports below are maintained for backward compatibility but are DEPRECATED.
 * Please migrate to the centralized data source.
 */

// @deprecated - Use SKILLS from '../data/skills' instead
export const SKILLS = {
  frontend: [
    { name: 'HTML5', level: 98, year: 2018, tagline: 'Foundation of the web', firstProject: 'Personal Blog' },
    { name: 'CSS3', level: 95, year: 2018, tagline: 'Styling maestro', firstProject: 'Personal Blog' },
    { name: 'JavaScript', level: 92, year: 2019, tagline: 'Core language for interactivity', firstProject: 'Weather Dashboard' },
    { name: 'React', level: 95, year: 2020, tagline: 'My go-to frontend framework', firstProject: 'E-Commerce Platform' },
    { name: 'TypeScript', level: 90, year: 2021, tagline: 'Type-safe development', firstProject: 'Task Management App' },
    { name: 'Tailwind CSS', level: 95, year: 2021, tagline: 'Rapid UI development', firstProject: 'Task Management App' },
    { name: 'Next.js', level: 85, year: 2022, tagline: 'Full-stack React framework', firstProject: 'Portfolio Builder' },
    { name: 'Vue.js', level: 75, year: 2023, tagline: 'Lightweight alternative', firstProject: 'Social Media Analytics' },
  ],
  backend: [
    { name: 'Node.js', level: 88, year: 2020, tagline: 'JavaScript on the server', firstProject: 'E-Commerce Platform' },
    { name: 'Express', level: 85, year: 2020, tagline: 'Minimalist web framework', firstProject: 'Chat Application' },
    { name: 'MongoDB', level: 85, year: 2020, tagline: 'NoSQL database', firstProject: 'E-Commerce Platform' },
    { name: 'REST APIs', level: 92, year: 2020, tagline: 'API design standard', firstProject: 'E-Commerce Platform' },
    { name: 'Python', level: 80, year: 2021, tagline: 'Data & backend powerhouse', firstProject: 'Social Media Analytics' },
    { name: 'PostgreSQL', level: 82, year: 2022, tagline: 'Relational database pro', firstProject: 'Social Media Analytics' },
    { name: 'Django', level: 75, year: 2023, tagline: 'Python web framework', firstProject: 'Social Media Analytics' },
    { name: 'GraphQL', level: 78, year: 2023, tagline: 'Modern API query language', firstProject: 'Portfolio Builder' },
  ],
  tools: [
    { name: 'Git', level: 95, year: 2019, tagline: 'Version control essential', firstProject: 'All Projects' },
    { name: 'VS Code', level: 98, year: 2019, tagline: 'Daily code editor', firstProject: 'All Projects' },
    { name: 'Firebase', level: 85, year: 2021, tagline: 'Real-time backend', firstProject: 'Task Management App' },
    { name: 'Figma', level: 85, year: 2021, tagline: 'Design collaboration', firstProject: 'E-Commerce Platform' },
    { name: 'Jest', level: 82, year: 2022, tagline: 'Testing framework', firstProject: 'Chat Application' },
    { name: 'Docker', level: 80, year: 2022, tagline: 'Containerization platform', firstProject: 'Social Media Analytics' },
    { name: 'Vercel', level: 90, year: 2022, tagline: 'Deployment made easy', firstProject: 'Portfolio Builder' },
    { name: 'AWS', level: 75, year: 2023, tagline: 'Cloud infrastructure', firstProject: 'E-Commerce Platform' },
  ],
};
