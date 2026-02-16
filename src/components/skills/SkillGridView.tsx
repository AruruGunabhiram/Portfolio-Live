import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isBrowser, prefersReducedMotion } from '../../utils';
import { SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../../data/skills';
import { SkillTooltip } from './SkillTooltip';

interface SkillGridViewProps {
  isGeekMode: boolean;
}

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

const SkillGridViewComponent = ({ isGeekMode }: SkillGridViewProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    skill: string | null;
    category: string;
  }>({ visible: false, x: 0, y: 0, skill: null, category: '' });

  useEffect(() => {
    if (!isBrowser || !gridRef.current || prefersReducedMotion()) return;

    const cards = gridRef.current.querySelectorAll('.skill-card');

    // Animate cards with improved ScrollTrigger
    cards.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate skill tags within each card
      const tags = card.querySelectorAll('.skill-tag');
      tags.forEach((tag, tagIndex) => {
        gsap.fromTo(tag,
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
              once: true, // Only animate once to prevent hiding on scroll up
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
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
      {SKILL_CATEGORIES.map((categoryConfig, index) => {
        const categorySkills = getSkillsByCategory(categoryConfig.key);

        return (
          <motion.div
            key={categoryConfig.key}
            className={`skill-card relative group rounded-xl p-6 transition-all duration-300 ${
              isGeekMode
                ? 'bg-[rgba(10,14,39,0.6)] backdrop-blur-md border border-cyan-500/50 hover:border-cyan-400'
                : 'bg-[rgba(10,14,39,0.6)] backdrop-blur-md border border-gray-700 hover:border-blue-400'
            }`}
            whileHover={{
              y: -8,
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            style={{
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              if (isGeekMode) {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0, 240, 255, 0.3)';
              } else {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(100, 108, 255, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Category emoji/icon at top */}
            <div className="text-4xl mb-4">{categoryConfig.icon}</div>

            {/* Category Title */}
            <h3
              className={`text-xl font-bold mb-2 font-mono ${
                isGeekMode ? 'text-cyber-cyan' : 'text-blue-400'
              }`}
            >
              {isGeekMode ? '> ' : ''}
              {categoryConfig.title}
            </h3>

            {/* Description */}
            <p
              className={`text-sm mb-4 leading-relaxed ${
                isGeekMode ? 'text-cyber-text-dim' : 'text-gray-400'
              }`}
            >
              {categoryConfig.description}
            </p>

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <motion.span
                  key={skill.name}
                  className={`skill-tag px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-default ${
                    isGeekMode
                      ? 'bg-cyber-cyan/10 border-cyber-cyan text-white'
                      : 'bg-blue-500/10 border-blue-500 text-gray-200'
                  }`}
                  style={{ opacity: 1 }} // Explicitly set opacity to 1 to ensure always visible
                  initial={{ opacity: 1 }} // Start visible
                  whileHover={{
                    backgroundColor: isGeekMode ? '#00f0ff' : '#646cff',
                    color: '#0a0e27',
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      skill: skill.name,
                      category: categoryConfig.title,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((prev) => ({
                      ...prev,
                      x: e.clientX,
                      y: e.clientY,
                    }));
                  }}
                  onMouseLeave={() => {
                    setTooltip((prev) => ({ ...prev, visible: false }));
                  }}
                  onClick={(e) => {
                    // Mobile tap to show tooltip
                    if (window.innerWidth < 768) {
                      setTooltip({
                        visible: !tooltip.visible,
                        x: e.clientX,
                        y: e.clientY,
                        skill: skill.name,
                        category: categoryConfig.title,
                      });
                    }
                  }}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>

          </motion.div>
        );
      })}
      </div>

      {/* Tooltip */}
      <SkillTooltip
        skill={{
          name: tooltip.skill || '',
          category: tooltip.category,
        }}
        relatedSkills={
          tooltip.skill
            ? (SKILLS.find(s => s.name === tooltip.skill)?.relatedSkills || [])
            : []
        }
        isVisible={tooltip.visible && !!tooltip.skill}
        x={tooltip.x}
        y={tooltip.y}
        isGeekMode={isGeekMode}
        onClose={() => setTooltip((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const SkillGridView = memo(
  SkillGridViewComponent,
  (prevProps, nextProps) => prevProps.isGeekMode === nextProps.isGeekMode
);
