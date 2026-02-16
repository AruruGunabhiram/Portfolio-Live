import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface SkillGridViewProps {
  isGeekMode: boolean;
}

interface SkillCategory {
  icon: string;
  title: string;
  description: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    icon: '💻',
    title: 'Languages',
    description: 'Core programming languages for building robust, scalable applications across multiple domains.',
    skills: ['Python', 'Java', 'C++', 'TypeScript', 'JavaScript', 'Ruby on Rails', 'GoLang', 'Smalltalk', 'Embedded C'],
  },
  {
    icon: '⚛️',
    title: 'Frontend Development',
    description: 'Modern frameworks and libraries for creating responsive, interactive user interfaces.',
    skills: ['React.js', 'Next.js', 'Vue.js', 'Angular', 'HTML5', 'Redux', 'Tailwind CSS', 'WebSockets'],
  },
  {
    icon: '⚙️',
    title: 'Backend & Frameworks',
    description: 'Server-side technologies for building APIs, microservices, and scalable architectures.',
    skills: ['Node.js', 'Express.js', 'Java Spring Boot', 'Python Django', 'Microservices', 'RESTful APIs', 'GraphQL'],
  },
  {
    icon: '🗄️',
    title: 'Databases & Data',
    description: 'SQL and NoSQL databases, message queues, and distributed data processing systems.',
    skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Kafka', 'Spark'],
  },
  {
    icon: '☁️',
    title: 'Cloud & DevOps',
    description: 'Cloud platforms, containerization, and CI/CD tools for modern deployment workflows.',
    skills: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD pipelines'],
  },
  {
    icon: '📊',
    title: 'Data & Analytics',
    description: 'Business intelligence, data warehousing, and analytics platforms for data-driven insights.',
    skills: ['Snowflake', 'Tableau', 'BigQuery', 'ETL Pipelines', 'Data Modeling'],
  },
  {
    icon: '🤖',
    title: 'AI/LLM Tools',
    description: 'Large language models and AI-powered development tools for enhanced productivity.',
    skills: ['ChatGPT', 'Claude API', 'GitHub Copilot', 'Cursor', 'Prompt Engineering'],
  },
  {
    icon: '🧪',
    title: 'Testing & QA',
    description: 'Testing frameworks and methodologies for ensuring code quality and reliability.',
    skills: ['Jest', 'Cypress', 'Unit Testing', 'Integration Testing'],
  },
];

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export const SkillGridView = ({ isGeekMode }: SkillGridViewProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBrowser || !gridRef.current || prefersReducedMotion()) return;

    const cards = gridRef.current.querySelectorAll('.skill-card');

    // Animate cards sliding up and fading in
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Animate skill tags within each card
      const tags = card.querySelectorAll('.skill-tag');
      tags.forEach((tag, tagIndex) => {
        gsap.fromTo(
          tag,
          {
            opacity: 0,
            scale: 0.8,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            delay: index * 0.1 + 0.3 + tagIndex * 0.03,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {skillCategories.map((category, index) => (
        <motion.div
          key={category.title}
          className={`skill-card relative group rounded-xl p-6 transition-cyber ${
            isGeekMode
              ? 'bg-cyber-bg-dark/20 border border-cyber-cyan'
              : 'bg-dark-surface/20 border border-gray-700'
          }`}
          style={{
            borderImage: isGeekMode
              ? 'linear-gradient(135deg, #00f0ff, #b026ff, #ff006e) 1'
              : undefined,
          }}
          whileHover={{
            y: -8,
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
        >
          {/* Hover glow effect */}
          <div
            className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
              isGeekMode ? 'box-glow-neon' : ''
            }`}
          />

          {/* Icon */}
          <div className="text-4xl mb-3">{category.icon}</div>

          {/* Category Title */}
          <h3
            className={`text-lg font-bold mb-2 ${
              isGeekMode ? 'text-cyber-cyan' : 'text-dark-accent'
            }`}
          >
            {isGeekMode ? '> ' : ''}
            {category.title}
          </h3>

          {/* Description */}
          <p
            className={`text-sm mb-4 leading-relaxed ${
              isGeekMode ? 'text-cyber-text-dim' : 'text-gray-400'
            }`}
          >
            {category.description}
          </p>

          {/* Skill Tags */}
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <motion.span
                key={skill}
                className={`skill-tag px-3 py-1.5 rounded-full text-xs font-medium border transition-cyber cursor-default ${
                  isGeekMode
                    ? 'bg-cyber-cyan/10 border-cyber-cyan text-white hover:bg-cyber-cyan hover:text-cyber-bg-dark'
                    : 'bg-blue-500/10 border-blue-500 text-gray-200 hover:bg-blue-500 hover:text-white'
                }`}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>

          {/* Corner accent */}
          {isGeekMode && (
            <div className="absolute top-2 right-2 w-3 h-3">
              <div className="absolute inset-0 border-t border-r border-cyber-cyan opacity-30" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
