import { useRef, useEffect, useState } from 'react';
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

export const SkillGridView = ({ isGeekMode }: SkillGridViewProps) => {
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
            <div className="text-4xl mb-3">{categoryConfig.icon}</div>

            {/* Category Title */}
            <h3
              className={`text-lg font-bold mb-2 ${
                isGeekMode ? 'text-cyber-cyan' : 'text-dark-accent'
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
                  className={`skill-tag px-3 py-1.5 rounded-full text-xs font-medium border transition-cyber cursor-default ${
                    isGeekMode
                      ? 'bg-cyber-cyan/10 border-cyber-cyan text-white hover:bg-cyber-cyan hover:text-cyber-bg-dark'
                      : 'bg-blue-500/10 border-blue-500 text-gray-200 hover:bg-blue-500 hover:text-white'
                  }`}
                  whileHover={{
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

            {/* Corner accent */}
            {isGeekMode && (
              <div className="absolute top-2 right-2 w-3 h-3">
                <div className="absolute inset-0 border-t border-r border-cyber-cyan opacity-30" />
              </div>
            )}
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
