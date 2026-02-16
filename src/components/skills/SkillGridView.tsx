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

  // Removed GSAP animations - skills should be immediately visible
  useEffect(() => {
    // Cleanup any existing scroll triggers
    return () => {
      if (isBrowser) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
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
                ? 'bg-[rgba(10,14,39,0.6)] backdrop-blur-md border-2 border-cyan-500/50'
                : 'bg-[rgba(10,14,39,0.6)] backdrop-blur-md border-2 border-gray-700'
            }`}
            whileHover={{
              y: -8,
              borderColor: isGeekMode ? '#00f0ff' : '#646cff',
              boxShadow: isGeekMode
                ? '0 12px 40px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.2)'
                : '0 12px 40px rgba(100, 108, 255, 0.4), 0 0 20px rgba(100, 108, 255, 0.2)',
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
            // Cards and skills are ALWAYS visible - no entrance animation
            style={{ opacity: 1, visibility: 'visible' }}
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
                      ? 'bg-cyber-cyan/10 border-cyber-cyan text-white opacity-100'
                      : 'bg-blue-500/10 border-blue-500 text-gray-200 opacity-100'
                  }`}
                  // No initial animation - always visible
                  whileHover={{
                    backgroundColor: isGeekMode ? '#00f0ff' : '#646cff',
                    color: '#0a0e27',
                    scale: 1.05,
                    boxShadow: isGeekMode
                      ? '0 0 20px rgba(0, 240, 255, 0.5)'
                      : '0 0 20px rgba(100, 108, 255, 0.5)',
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
