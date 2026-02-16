import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECTS } from '../../utils/constants';

interface SkillTooltipProps {
  skill: {
    name: string;
    category?: string;
    year?: number;
    tagline?: string;
    firstProject?: string;
  };
  relatedSkills?: string[];
  isVisible: boolean;
  x: number;
  y: number;
  isGeekMode: boolean;
  onClose?: () => void;
}

export const SkillTooltip = ({
  skill,
  relatedSkills = [],
  isVisible,
  x,
  y,
  isGeekMode,
  onClose,
}: SkillTooltipProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Calculate project count
  const projectCount = PROJECTS.filter((project) =>
    project.techStack.some((tech) =>
      tech.toLowerCase().includes(skill.name.toLowerCase()) ||
      skill.name.toLowerCase().includes(tech.toLowerCase())
    )
  ).length;

  // Boundary detection and position calculation
  useEffect(() => {
    if (!isVisible) return;

    const tooltipWidth = 300;
    const tooltipHeight = 250; // Approximate height
    const offset = 20;

    let finalX = x + offset;
    let finalY = y - tooltipHeight / 2;

    // Right boundary check
    if (finalX + tooltipWidth > window.innerWidth) {
      finalX = x - tooltipWidth - offset;
    }

    // Bottom boundary check
    if (finalY + tooltipHeight > window.innerHeight) {
      finalY = window.innerHeight - tooltipHeight - offset;
    }

    // Top boundary check
    if (finalY < offset) {
      finalY = offset;
    }

    // Left boundary check
    if (finalX < offset) {
      finalX = offset;
    }

    setPosition({ x: finalX, y: finalY });
  }, [x, y, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.2,
          }}
          className={`fixed z-[100] pointer-events-none max-w-[300px] rounded-xl p-4 ${
            isGeekMode
              ? 'bg-cyber-bg-dark/95 border-2 border-cyber-pink'
              : 'bg-dark-surface/95 border-2 border-dark-accent'
          }`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            backdropFilter: 'blur(12px)',
            boxShadow: isGeekMode
              ? '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(255, 0, 110, 0.3), 0 8px 32px rgba(0, 0, 0, 0.6)'
              : '0 8px 32px rgba(0, 0, 0, 0.6)',
          }}
          onClick={onClose}
        >
          {/* Skill Name */}
          <h3
            className={`text-lg font-bold mb-2 ${
              isGeekMode ? 'text-cyber-cyan text-glow-neon' : 'text-dark-accent'
            }`}
          >
            {isGeekMode ? '> ' : ''}
            {skill.name}
          </h3>

          {/* Glowing Divider */}
          <div
            className={`h-0.5 mb-3 ${
              isGeekMode ? 'bg-cyber-pink' : 'bg-dark-accent'
            }`}
            style={{
              boxShadow: isGeekMode ? '0 0 8px rgba(255, 0, 110, 0.6)' : 'none',
            }}
          />

          {/* Category */}
          {skill.category && (
            <div className="text-xs opacity-60 mb-2 capitalize">
              {skill.category}
            </div>
          )}

          {/* Description */}
          <p className="text-sm mb-3 opacity-90 leading-relaxed">
            {skill.tagline || 'Core technology in my tech stack'}
          </p>

          {/* Experience Context */}
          <div className="text-xs opacity-70 mb-3 space-y-1">
            {skill.year && (
              <div>
                <span className="font-semibold">First used:</span> {skill.year}
                {skill.firstProject && ` in ${skill.firstProject}`}
              </div>
            )}
            {projectCount > 0 && (
              <div>
                <span className="font-semibold">Used in:</span> {projectCount} project
                {projectCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Usage Bar (NOT proficiency) */}
          {projectCount > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span>Project Usage</span>
                <span>{projectCount}/{PROJECTS.length}</span>
              </div>
              <div
                className={`h-1.5 rounded-full overflow-hidden ${
                  isGeekMode ? 'bg-cyber-cyan/20' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectCount / PROJECTS.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full ${
                    isGeekMode ? 'gradient-cyber' : 'bg-dark-accent'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Related Skills */}
          {relatedSkills.length > 0 && (
            <div className="pt-3 border-t border-current/20">
              <div className="text-xs font-semibold mb-2 opacity-70">
                Used with:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {relatedSkills.slice(0, 4).map((relatedSkill) => (
                  <span
                    key={relatedSkill}
                    className={`px-2 py-1 rounded-full text-xs ${
                      isGeekMode
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {relatedSkill}
                  </span>
                ))}
                {relatedSkills.length > 4 && (
                  <span className="text-xs opacity-50">
                    +{relatedSkills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mobile close hint */}
          <div className="md:hidden text-xs opacity-40 mt-3 text-center">
            Tap anywhere to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
