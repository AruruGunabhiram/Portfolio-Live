import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { isBrowser, prefersReducedMotion } from '../../utils';
import { PROJECTS, SKILL_RELATIONSHIPS } from '../../utils/constants';
import { SkillTooltip } from './SkillTooltip';

interface SkillTimelineProps {
  skills: Record<string, Array<{ name: string; level?: number; year?: number; tagline?: string; firstProject?: string }>>;
  isGeekMode: boolean;
}

interface TimelineNode {
  name: string;
  category: string;
  year: number;
  tagline: string;
  firstProject: string;
  projectCount: number;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  color: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  skill: TimelineNode | null;
}

export const SkillTimeline = ({ skills, isGeekMode }: SkillTimelineProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, skill: null });
  const nodesRef = useRef<TimelineNode[]>([]);

  useEffect(() => {
    if (!isBrowser || !svgRef.current) return;

    const reducedMotion = prefersReducedMotion();

    // Category colors
    const categoryColors: Record<string, string> = {
      frontend: isGeekMode ? '#00f0ff' : '#646cff',
      backend: isGeekMode ? '#b026ff' : '#8b5cf6',
      tools: isGeekMode ? '#ff006e' : '#ec4899',
    };

    // Calculate project count for each skill
    const calculateProjectCount = (skillName: string): number => {
      return PROJECTS.filter((project) =>
        project.techStack.some((tech) => tech.toLowerCase().includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(tech.toLowerCase()))
      ).length;
    };

    // Get node size based on project count
    const getNodeSize = (count: number): 'small' | 'medium' | 'large' => {
      if (count >= 4) return 'large';
      if (count >= 2) return 'medium';
      return 'small';
    };

    // Flatten and sort skills by year
    const allSkills: TimelineNode[] = [];
    Object.entries(skills).forEach(([category, categorySkills]) => {
      categorySkills.forEach((skill) => {
        const projectCount = calculateProjectCount(skill.name);
        allSkills.push({
          name: skill.name,
          category,
          year: skill.year || 2020,
          tagline: skill.tagline || 'Essential tech',
          firstProject: skill.firstProject || 'Various Projects',
          projectCount,
          x: 0,
          y: 0,
          size: getNodeSize(projectCount),
          color: categoryColors[category] || categoryColors.frontend,
        });
      });
    });

    // Sort by year
    allSkills.sort((a, b) => a.year - b.year);

    // Calculate positions along timeline
    const padding = 80;
    const width = 1000;
    const height = 400;
    const timelineY = height / 2;
    const timelineStart = padding;
    const timelineEnd = width - padding;
    const minYear = Math.min(...allSkills.map((s) => s.year));
    const maxYear = Math.max(...allSkills.map((s) => s.year));
    const yearRange = maxYear - minYear || 1;

    allSkills.forEach((skill, index) => {
      const progress = (skill.year - minYear) / yearRange;
      skill.x = timelineStart + progress * (timelineEnd - timelineStart);

      // Alternate nodes above and below timeline to avoid overlap
      const verticalOffset = index % 2 === 0 ? -80 : 80;
      skill.y = timelineY + verticalOffset;
    });

    nodesRef.current = allSkills;

    // GSAP Timeline animation
    if (!reducedMotion) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate timeline line drawing
      const timelinePath = svgRef.current.querySelector('.timeline-path');
      if (timelinePath) {
        timeline.fromTo(
          timelinePath,
          { strokeDashoffset: 1000 },
          { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }
        );
      }

      // Animate nodes appearing
      allSkills.forEach((skill, index) => {
        const nodeElement = svgRef.current?.querySelector(`#node-${index}`);
        const labelElement = svgRef.current?.querySelector(`#label-${index}`);
        const yearElement = svgRef.current?.querySelector(`#year-${index}`);

        if (nodeElement) {
          const delay = 0.8 + index * 0.08;
          timeline.fromTo(
            nodeElement,
            { scale: 0, opacity: 0, transformOrigin: 'center' },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
            delay
          );

          if (labelElement) {
            timeline.fromTo(
              labelElement,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.3 },
              delay + 0.2
            );
          }

          if (yearElement) {
            timeline.fromTo(
              yearElement,
              { opacity: 0 },
              { opacity: 0.5, duration: 0.3 },
              delay + 0.2
            );
          }
        }
      });
    }

    return () => {
      // Cleanup handled by GSAP
    };
  }, [skills, isGeekMode]);

  const handleNodeHover = (index: number, event: React.MouseEvent) => {
    setHoveredNode(index);
    const node = nodesRef.current[index];
    if (node) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        skill: node,
      });
    }
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
    setTooltip({ visible: false, x: 0, y: 0, skill: null });
  };

  const getNodeRadius = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'large':
        return 20;
      case 'medium':
        return 15;
      case 'small':
        return 10;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 400"
        className="w-full h-auto min-h-[400px]"
        role="img"
        aria-label="Technology timeline showing learning journey"
      >
        <defs>
          {/* Timeline gradient */}
          <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isGeekMode ? '#00f0ff' : '#646cff'} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isGeekMode ? '#b026ff' : '#8b5cf6'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isGeekMode ? '#ff006e' : '#ec4899'} stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Timeline line */}
        <line
          className="timeline-path"
          x1="80"
          y1="200"
          x2="920"
          y2="200"
          stroke="url(#timeline-gradient)"
          strokeWidth="3"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          strokeLinecap="round"
        />

        {/* Timeline markers (years) */}
        {Array.from(new Set(nodesRef.current.map((n) => n.year)))
          .sort()
          .map((year, index) => {
            const minYear = Math.min(...nodesRef.current.map((s) => s.year));
            const maxYear = Math.max(...nodesRef.current.map((s) => s.year));
            const yearRange = maxYear - minYear || 1;
            const progress = (year - minYear) / yearRange;
            const x = 80 + progress * (920 - 80);

            return (
              <g key={year}>
                <line
                  x1={x}
                  y1="190"
                  x2={x}
                  y2="210"
                  stroke={isGeekMode ? 'rgba(0, 240, 255, 0.3)' : 'rgba(100, 108, 255, 0.3)'}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y="235"
                  textAnchor="middle"
                  fill={isGeekMode ? '#00f0ff' : '#646cff'}
                  fontSize="12"
                  fontFamily="monospace"
                  opacity="0.6"
                >
                  {year}
                </text>
              </g>
            );
          })}

        {/* Skill nodes */}
        {nodesRef.current.map((node, index) => {
          const radius = getNodeRadius(node.size);
          const isHovered = hoveredNode === index;
          const yOffset = isHovered ? -10 : 0;

          return (
            <g
              key={`${node.name}-${index}`}
              id={`node-${index}`}
              style={{ cursor: 'pointer', transformOrigin: `${node.x}px ${node.y}px` }}
              onMouseEnter={(e) => handleNodeHover(index, e)}
              onMouseLeave={handleNodeLeave}
            >
              {/* Connecting line to timeline */}
              <line
                x1={node.x}
                y1={200}
                x2={node.x}
                y2={node.y + yOffset}
                stroke={node.color}
                strokeWidth="1.5"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />

              {/* Node glow (on hover) */}
              {isHovered && (
                <circle
                  cx={node.x}
                  cy={node.y + yOffset}
                  r={radius + 8}
                  fill={node.color}
                  opacity="0.3"
                  filter="url(#glow)"
                />
              )}

              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y + yOffset}
                r={radius}
                fill={node.color}
                stroke={isHovered ? '#ffffff' : node.color}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 1 : 0.9}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Inner highlight */}
              <circle
                cx={node.x - radius * 0.3}
                cy={node.y + yOffset - radius * 0.3}
                r={radius * 0.3}
                fill="rgba(255, 255, 255, 0.4)"
              />

              {/* Skill name label */}
              <text
                id={`label-${index}`}
                x={node.x}
                y={node.y > 200 ? node.y + yOffset + radius + 18 : node.y + yOffset - radius - 8}
                textAnchor="middle"
                fill={isGeekMode ? '#00f0ff' : '#e5e7eb'}
                fontSize={isHovered ? '13' : '11'}
                fontWeight={isHovered ? 'bold' : 'normal'}
                fontFamily="monospace"
                style={{ transition: 'all 0.3s ease' }}
              >
                {node.name}
              </text>

              {/* Project count indicator */}
              {node.projectCount > 0 && (
                <text
                  id={`year-${index}`}
                  x={node.x}
                  y={node.y > 200 ? node.y + yOffset + radius + 32 : node.y + yOffset - radius - 22}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="9"
                  fontFamily="monospace"
                  opacity="0.5"
                >
                  {node.projectCount} project{node.projectCount !== 1 ? 's' : ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <SkillTooltip
        skill={{
          name: tooltip.skill?.name || '',
          category: tooltip.skill?.category,
          year: tooltip.skill?.year,
          tagline: tooltip.skill?.tagline,
          firstProject: tooltip.skill?.firstProject,
        }}
        relatedSkills={tooltip.skill ? SKILL_RELATIONSHIPS[tooltip.skill.name] || [] : []}
        isVisible={tooltip.visible && !!tooltip.skill}
        x={tooltip.x}
        y={tooltip.y}
        isGeekMode={isGeekMode}
      />

      {/* Legend */}
      <div
        className={`mt-8 flex flex-wrap justify-center gap-6 text-xs ${
          isGeekMode ? 'text-cyber-text' : 'text-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-cyan' : 'bg-blue-500'}`} />
          <span>Frontend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-purple' : 'bg-purple-500'}`} />
          <span>Backend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-pink' : 'bg-pink-500'}`} />
          <span>Tools</span>
        </div>
        <div className="ml-4 opacity-60">
          <span className="mr-2">•</span>
          Node size = usage frequency
        </div>
      </div>
    </div>
  );
};
