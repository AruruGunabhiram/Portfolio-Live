import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { isBrowser, prefersReducedMotion } from '../../utils';
import { SKILLS_CONSTELLATION, SKILL_RELATIONSHIPS } from '../../utils/constants';
import { SkillTooltip } from './SkillTooltip';

interface SkillNode {
  name: string;
  category: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  drawn: boolean;
  visible: boolean;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  skill: SkillNode | null;
  relatedSkills: string[];
}

interface SkillRadialChartProps {
  skills?: Record<string, Array<{ name: string; level?: number }>>;
  isGeekMode: boolean;
}

export const SkillRadialChart = ({ isGeekMode }: SkillRadialChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, skill: null, relatedSkills: [] });
  const nodesRef = useRef<SkillNode[]>([]);
  const pulsePhaseRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 700;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const reducedMotion = prefersReducedMotion();

    // Create skill nodes with proper positioning
    const nodes: SkillNode[] = [];

    Object.entries(SKILLS_CONSTELLATION).forEach(([category, config]) => {
      const { skills, zone, color } = config;
      const { startAngle, endAngle, innerRing } = zone;

      // Convert angles to radians (0° at top, clockwise)
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const angleRange = endRad - startRad;
      const angleStep = angleRange / (skills.length + 1);

      // Radius based on ring
      const baseRadius = innerRing ? 120 : 240;

      skills.forEach((skillName, index) => {
        const angle = startRad + angleStep * (index + 1);
        // Add slight radius variation for visual interest
        const radius = baseRadius + (Math.random() - 0.5) * 20;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        nodes.push({
          name: skillName,
          category,
          x,
          y,
          angle,
          radius,
          drawn: false,
          visible: false,
        });
      });
    });

    nodesRef.current = nodes;

    // Draw background grid
    const drawBackground = () => {
      // Concentric circles
      ctx.strokeStyle = isGeekMode ? 'rgba(0, 240, 255, 0.05)' : 'rgba(100, 108, 255, 0.05)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 260 * fraction, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radial lines for quadrants
      ctx.strokeStyle = isGeekMode ? 'rgba(0, 240, 255, 0.08)' : 'rgba(100, 108, 255, 0.08)';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 260, centerY + Math.sin(angle) * 260);
        ctx.stroke();
      }

      // Category labels
      ctx.font = 'bold 11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      const categoryLabels = [
        { text: 'FRONTEND', angle: 45, radius: 280 },
        { text: 'BACKEND', angle: 135, radius: 280 },
        { text: 'DATABASES', angle: 225, radius: 280 },
        { text: 'CLOUD/DEVOPS', angle: 315, radius: 280 },
      ];

      categoryLabels.forEach(({ text, angle, radius }) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * radius;
        const y = centerY + Math.sin(rad) * radius;
        ctx.fillStyle = isGeekMode ? 'rgba(0, 240, 255, 0.4)' : 'rgba(100, 108, 255, 0.4)';
        ctx.fillText(text, x, y);
      });
    };

    // Draw center pulsing node
    const drawCenterNode = () => {
      pulsePhaseRef.current += 0.03;
      const pulseScale = 1 + Math.sin(pulsePhaseRef.current) * 0.15;

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25 * pulseScale);
      gradient.addColorStop(0, isGeekMode ? 'rgba(0, 240, 255, 0.8)' : 'rgba(100, 108, 255, 0.8)');
      gradient.addColorStop(0.5, isGeekMode ? 'rgba(0, 240, 255, 0.3)' : 'rgba(100, 108, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Core node
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10);
      coreGradient.addColorStop(0, isGeekMode ? '#00f0ff' : '#646cff');
      coreGradient.addColorStop(1, isGeekMode ? '#b026ff' : '#8b5cf6');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(centerX - 3, centerY - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw connection with animated gradient flow
    const drawConnection = (node: SkillNode, progress: number, glowIntensity = 1) => {
      const categoryConfig = SKILLS_CONSTELLATION[node.category as keyof typeof SKILLS_CONSTELLATION];
      const categoryColor = categoryConfig?.color || '#00f0ff';

      // Create gradient that flows from center to node
      const gradient = ctx.createLinearGradient(centerX, centerY, node.x, node.y);
      const flowOffset = (pulsePhaseRef.current * 0.1) % 1;

      if (isGeekMode) {
        gradient.addColorStop(0, `rgba(176, 38, 255, ${0.5 * glowIntensity})`); // Purple at center
        gradient.addColorStop(flowOffset, `rgba(0, 240, 255, ${0.8 * glowIntensity})`); // Flowing cyan
        gradient.addColorStop(1, `${categoryColor}${Math.floor(200 * glowIntensity).toString(16).padStart(2, '0')}`);
      } else {
        gradient.addColorStop(0, `rgba(100, 108, 255, ${0.5 * glowIntensity})`);
        gradient.addColorStop(1, `rgba(100, 108, 255, ${0.7 * glowIntensity})`);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = glowIntensity > 1 ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + (node.x - centerX) * progress,
        centerY + (node.y - centerY) * progress
      );
      ctx.stroke();
    };

    // Draw skill node with label
    const drawSkillNode = (node: SkillNode, scale = 1, glowIntensity = 1) => {
      const categoryConfig = SKILLS_CONSTELLATION[node.category as keyof typeof SKILLS_CONSTELLATION];
      const categoryColor = categoryConfig?.color || '#00f0ff';
      const nodeRadius = 5 * scale;
      const isHovered = hoveredNode === nodesRef.current.indexOf(node);

      // Outer glow
      if (glowIntensity > 1) {
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 4);
        glowGradient.addColorStop(0, isGeekMode ? `${categoryColor}cc` : 'rgba(100, 108, 255, 0.8)');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius);
      if (isGeekMode) {
        nodeGradient.addColorStop(0, isHovered ? '#ff006e' : categoryColor);
        nodeGradient.addColorStop(1, isHovered ? '#b026ff' : categoryColor);
      } else {
        nodeGradient.addColorStop(0, '#646cff');
        nodeGradient.addColorStop(1, '#8b5cf6');
      }

      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isHovered ? (isGeekMode ? '#ff006e' : '#fff') : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Skill name label
      if (node.visible) {
        const fontSize = isHovered ? 14 : 12;
        ctx.font = `${fontSize}px "Fira Code", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow/glow for readability
        if (isHovered && isGeekMode) {
          ctx.shadowColor = '#ff006e';
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = isHovered ? (isGeekMode ? '#ff006e' : '#fff') : (isGeekMode ? categoryColor : '#e5e7eb');

        // Position label based on node position relative to center
        const labelOffset = isHovered ? 20 : 16;
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const labelX = node.x + (dx / distance) * labelOffset;
        const labelY = node.y + (dy / distance) * labelOffset;

        ctx.fillText(node.name, labelX, labelY);
        ctx.shadowBlur = 0;
      }
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      drawBackground();
      drawCenterNode();

      nodesRef.current.forEach((node, index) => {
        const glowIntensity = hoveredNode === index ? 2 : 1;
        const scale = hoveredNode === index ? 1.3 : 1;

        if (node.drawn) {
          drawConnection(node, 1, glowIntensity);
          drawSkillNode(node, scale, glowIntensity);
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // GSAP timeline for sequential drawing
    if (!reducedMotion) {
      const timeline = gsap.timeline();

      nodesRef.current.forEach((node, index) => {
        // Draw connection line
        timeline.to(
          {},
          {
            duration: 0.4,
            onStart: () => {
              node.drawn = true;
            },
          },
          index * 0.05
        );

        // Fade in skill name with typewriter effect
        timeline.to(
          {},
          {
            duration: 0.2,
            onStart: () => {
              node.visible = true;
            },
          },
          index * 0.05 + 0.3
        );
      });
    } else {
      nodesRef.current.forEach((node) => {
        node.drawn = true;
        node.visible = true;
      });
    }

    animate();

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * size;
      const mouseY = ((e.clientY - rect.top) / rect.height) * size;

      let foundHover = false;

      nodesRef.current.forEach((node, index) => {
        const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        if (distance < 25) {
          setHoveredNode(index);
          const relatedSkills = SKILL_RELATIONSHIPS[node.name] || [];
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            skill: node,
            relatedSkills,
          });
          foundHover = true;
        }
      });

      if (!foundHover) {
        setHoveredNode(null);
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isGeekMode, hoveredNode]);

  return (
    <div className="relative flex justify-center" ref={overlayRef}>
      <canvas
        ref={canvasRef}
        className="max-w-full cursor-crosshair"
        aria-label="Constellation map showing comprehensive tech stack"
        role="img"
      />

      {/* Enhanced Tooltip */}
      <SkillTooltip
        skill={{
          name: tooltip.skill?.name || '',
          category: tooltip.skill ? SKILLS_CONSTELLATION[tooltip.skill.category as keyof typeof SKILLS_CONSTELLATION]?.description : '',
        }}
        relatedSkills={tooltip.relatedSkills}
        isVisible={tooltip.visible && !!tooltip.skill}
        x={tooltip.x}
        y={tooltip.y}
        isGeekMode={isGeekMode}
      />

      {/* Legend */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-3 justify-center text-xs ${
          isGeekMode ? 'text-cyber-text' : 'text-gray-400'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isGeekMode ? 'bg-cyber-cyan' : 'bg-blue-500'}`} />
          <span>Frontend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isGeekMode ? 'bg-cyber-purple' : 'bg-purple-500'}`} />
          <span>Backend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isGeekMode ? 'bg-cyber-pink' : 'bg-pink-500'}`} />
          <span>Databases</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isGeekMode ? 'bg-cyan-400' : 'bg-cyan-500'}`} />
          <span>Cloud</span>
        </div>
      </div>
    </div>
  );
};
