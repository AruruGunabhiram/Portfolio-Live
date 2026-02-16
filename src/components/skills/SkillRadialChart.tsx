import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface SkillNode {
  name: string;
  category: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  drawn: boolean;
}

interface Particle {
  progress: number;
  skillIndex: number;
  speed: number;
}

interface SkillRadialChartProps {
  skills: Record<string, Array<{ name: string; level?: number }>>;
  isGeekMode: boolean;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  skill: string;
  category: string;
}

export const SkillRadialChart = ({ skills, isGeekMode }: SkillRadialChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, skill: '', category: '' });
  const nodesRef = useRef<SkillNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const pulsePhaseRef = useRef(0);

  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 600;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const reducedMotion = prefersReducedMotion();

    // Category configuration with angular sections and colors
    const categoryConfig: Record<string, { startAngle: number; endAngle: number; color: string; radius: number }> = {
      frontend: { startAngle: -Math.PI / 2, endAngle: Math.PI / 6, color: '#00f0ff', radius: 200 },
      backend: { startAngle: Math.PI / 6, endAngle: Math.PI / 2 + Math.PI / 3, color: '#b026ff', radius: 180 },
      tools: { startAngle: Math.PI / 2 + Math.PI / 3, endAngle: Math.PI * 3 / 2, color: '#ff006e', radius: 160 },
    };

    // Create skill nodes positioned by category
    const nodes: SkillNode[] = [];
    Object.entries(skills).forEach(([category, categorySkills]) => {
      const config = categoryConfig[category];
      if (!config) return;

      const angleRange = config.endAngle - config.startAngle;
      const angleStep = angleRange / (categorySkills.length + 1);

      categorySkills.forEach((skill, index) => {
        const angle = config.startAngle + angleStep * (index + 1);
        const radius = config.radius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        nodes.push({
          name: skill.name,
          category,
          x,
          y,
          angle,
          radius,
          drawn: false,
        });
      });
    });

    nodesRef.current = nodes;

    // Initialize particles
    particlesRef.current = nodes.map((_, index) => ({
      progress: Math.random(),
      skillIndex: index,
      speed: 0.003 + Math.random() * 0.002,
    }));

    // Draw background grid (radar/HUD style)
    const drawBackground = () => {
      // Concentric circles
      ctx.strokeStyle = isGeekMode ? 'rgba(0, 240, 255, 0.08)' : 'rgba(100, 108, 255, 0.08)';
      ctx.lineWidth = 1;
      [0.3, 0.5, 0.7, 1].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 220 * fraction, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radial lines
      ctx.strokeStyle = isGeekMode ? 'rgba(0, 240, 255, 0.05)' : 'rgba(100, 108, 255, 0.05)';
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 220, centerY + Math.sin(angle) * 220);
        ctx.stroke();
      }

      // Category arc labels
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      Object.entries(categoryConfig).forEach(([category, config]) => {
        const midAngle = (config.startAngle + config.endAngle) / 2;
        const labelRadius = 235;
        const x = centerX + Math.cos(midAngle) * labelRadius;
        const y = centerY + Math.sin(midAngle) * labelRadius;
        ctx.fillStyle = isGeekMode ? config.color : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(category.toUpperCase(), x, y);
      });
    };

    // Draw center pulsing node
    const drawCenterNode = () => {
      pulsePhaseRef.current += 0.05;
      const pulseScale = 1 + Math.sin(pulsePhaseRef.current) * 0.2;

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20 * pulseScale);
      gradient.addColorStop(0, isGeekMode ? 'rgba(0, 240, 255, 0.8)' : 'rgba(100, 108, 255, 0.8)');
      gradient.addColorStop(0.5, isGeekMode ? 'rgba(0, 240, 255, 0.3)' : 'rgba(100, 108, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Core node
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8);
      coreGradient.addColorStop(0, isGeekMode ? '#00f0ff' : '#646cff');
      coreGradient.addColorStop(1, isGeekMode ? '#b026ff' : '#8b5cf6');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw connection line with gradient
    const drawConnection = (node: SkillNode, progress: number, glowIntensity = 1) => {
      const gradient = ctx.createLinearGradient(centerX, centerY, node.x, node.y);
      const categoryColor = categoryConfig[node.category]?.color || '#00f0ff';

      if (isGeekMode) {
        gradient.addColorStop(0, `rgba(176, 38, 255, ${0.6 * glowIntensity})`); // Purple at center
        gradient.addColorStop(1, `${categoryColor}${Math.floor(255 * glowIntensity).toString(16).padStart(2, '0')}`);
      } else {
        gradient.addColorStop(0, `rgba(100, 108, 255, ${0.6 * glowIntensity})`);
        gradient.addColorStop(1, `rgba(100, 108, 255, ${0.8 * glowIntensity})`);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = glowIntensity > 1 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + (node.x - centerX) * progress,
        centerY + (node.y - centerY) * progress
      );
      ctx.stroke();
    };

    // Draw skill node
    const drawSkillNode = (node: SkillNode, scale = 1, glowIntensity = 1) => {
      const nodeRadius = 6 * scale;
      const categoryColor = categoryConfig[node.category]?.color || '#00f0ff';

      // Outer glow
      if (glowIntensity > 1) {
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 3);
        glowGradient.addColorStop(0, `${categoryColor}80`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node gradient (cyan → pink)
      const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius);
      if (isGeekMode) {
        nodeGradient.addColorStop(0, categoryColor);
        nodeGradient.addColorStop(1, '#ff006e');
      } else {
        nodeGradient.addColorStop(0, '#646cff');
        nodeGradient.addColorStop(1, '#8b5cf6');
      }

      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(node.x - 1.5, node.y - 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw particle on connection line
    const drawParticle = (node: SkillNode, progress: number) => {
      const x = centerX + (node.x - centerX) * progress;
      const y = centerY + (node.y - centerY) * progress;
      const categoryColor = categoryConfig[node.category]?.color || '#00f0ff';

      ctx.fillStyle = isGeekMode ? categoryColor : '#646cff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.fillStyle = isGeekMode ? `${categoryColor}40` : 'rgba(100, 108, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      drawBackground();
      drawCenterNode();

      // Draw connections and nodes
      nodesRef.current.forEach((node, index) => {
        const glowIntensity = hoveredNode === index ? 2 : 1;
        const scale = hoveredNode === index ? 1.4 : 1;

        if (node.drawn) {
          drawConnection(node, 1, glowIntensity);
          drawSkillNode(node, scale, glowIntensity);
        }
      });

      // Draw particles
      if (!reducedMotion) {
        particlesRef.current.forEach((particle) => {
          const node = nodesRef.current[particle.skillIndex];
          if (node?.drawn) {
            drawParticle(node, particle.progress);
            particle.progress += particle.speed;
            if (particle.progress > 1) {
              particle.progress = 0;
            }
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Animate lines drawing in sequence using GSAP
    if (!reducedMotion) {
      const timeline = gsap.timeline();

      nodesRef.current.forEach((node, index) => {
        timeline.to(
          {},
          {
            duration: 0.3,
            onStart: () => {
              let progress = 0;
              const drawInterval = setInterval(() => {
                progress += 0.05;
                if (progress >= 1) {
                  progress = 1;
                  clearInterval(drawInterval);
                  node.drawn = true;
                }
              }, 16);
            },
          },
          index * 0.08
        );
      });
    } else {
      nodesRef.current.forEach((node) => {
        node.drawn = true;
      });
    }

    animate();

    // Mouse move handler for hover detection
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * size;
      const mouseY = ((e.clientY - rect.top) / rect.height) * size;

      let foundHover = false;

      nodesRef.current.forEach((node, index) => {
        const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        if (distance < 15) {
          setHoveredNode(index);
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            skill: node.name,
            category: node.category,
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
  }, [skills, isGeekMode, hoveredNode]);

  return (
    <div ref={containerRef} className="relative flex justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full cursor-crosshair"
        aria-label="Constellation map showing tech stack ecosystem"
        role="img"
      />

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={`fixed pointer-events-none z-50 px-4 py-3 rounded-lg border ${
            isGeekMode
              ? 'bg-cyber-bg-darker border-cyber-cyan text-cyber-text glow-cyan'
              : 'bg-dark-surface border-dark-accent text-white'
          }`}
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y - 10}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className={`font-bold text-sm mb-1 ${isGeekMode ? 'text-cyber-cyan' : 'text-dark-accent'}`}>
            {isGeekMode ? '> ' : ''}{tooltip.skill}
          </div>
          <div className="text-xs opacity-70 capitalize">{tooltip.category} • Tech Stack</div>
        </div>
      )}

      {/* Legend */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-xs ${
          isGeekMode ? 'text-cyber-text' : 'text-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-cyan' : 'bg-dark-accent'}`} />
          <span>Frontend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-purple' : 'bg-dark-accent'}`} />
          <span>Backend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isGeekMode ? 'bg-cyber-pink' : 'bg-dark-accent'}`} />
          <span>Tools</span>
        </div>
      </div>
    </div>
  );
};
