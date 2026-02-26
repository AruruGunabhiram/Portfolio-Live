import { useEffect, useRef } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';
import { SKILLS } from '../../data/resume';

interface Node {
  name: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: [number, number, number];
}

// Category → muted RGB color
const CAT_COLORS: Record<string, [number, number, number]> = {
  'Programming Languages': [91, 168, 196],
  'Backend & Systems': [126, 192, 214],
  'Frontend': [126, 147, 200],
  'Databases': [107, 134, 180],
  'Applied AI (Backend)': [150, 120, 180],
  'Software Design': [120, 160, 190],
  'DevOps & Tools': [100, 140, 160],
};
const DEFAULT_COLOR: [number, number, number] = [91, 168, 196];

const CONNECT_DIST = 160;
const NODE_RADIUS = 4;
const HOVER_RADIUS = 22;

interface SkillConstellationProps {
  isGeekMode: boolean;
}

export const SkillConstellation = ({ isGeekMode }: SkillConstellationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isBrowser) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    let rafId = 0;
    let hoveredIndex = -1;
    const mouse = { x: -9999, y: -9999 };

    // Flatten skills
    const allSkills: Array<{ name: string; category: string }> = [];
    for (const cat of SKILLS) {
      for (const skill of cat.skills) {
        allSkills.push({ name: skill, category: cat.category });
      }
    }

    let nodes: Node[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : 800;
      h = parent ? parent.clientHeight : 500;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initNodes = (): Node[] => {
      const margin = 60;
      return allSkills.map(s => ({
        name: s.name,
        category: s.category,
        x: margin + Math.random() * (w - margin * 2),
        y: margin + Math.random() * (h - margin * 2),
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        color: CAT_COLORS[s.category] ?? DEFAULT_COLOR,
      }));
    };

    resize();
    nodes = initNodes();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);

    const FONT = isGeekMode
      ? "10px 'Courier New', monospace"
      : '10px -apple-system, BlinkMacSystemFont, sans-serif';

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const margin = 40;

      // Update positions + bounce
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < margin) { n.x = margin; n.vx = Math.abs(n.vx); }
        else if (n.x > w - margin) { n.x = w - margin; n.vx = -Math.abs(n.vx); }
        if (n.y < margin) { n.y = margin; n.vy = Math.abs(n.vy); }
        else if (n.y > h - margin) { n.y = h - margin; n.vy = -Math.abs(n.vy); }
      }

      // Find hovered node
      hoveredIndex = -1;
      for (let i = 0; i < nodes.length; i++) {
        const d = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
        if (d < HOVER_RADIUS) { hoveredIndex = i; break; }
      }

      const hasHover = hoveredIndex !== -1;

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= CONNECT_DIST) continue;

          const isConnectedToHover = hasHover && (i === hoveredIndex || j === hoveredIndex);
          const base = 1 - dist / CONNECT_DIST;

          let op: number;
          if (!hasHover) {
            op = base * 0.18;
          } else if (isConnectedToHover) {
            op = base * 0.55;
          } else {
            op = base * 0.04;
          }

          if (op < 0.01) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(91,168,196,${op.toFixed(3)})`;
          ctx.lineWidth = isConnectedToHover ? 0.9 : 0.5;
          ctx.stroke();
        }
      }

      // Draw nodes + labels
      ctx.font = FONT;
      ctx.textBaseline = 'middle';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hoveredIndex;
        const isDimmed = hasHover && !isHovered;

        const nodeOp = isDimmed ? 0.25 : isHovered ? 1 : 0.75;
        const labelOp = isDimmed ? 0.18 : isHovered ? 1 : 0.55;
        const r = isHovered ? NODE_RADIUS + 2 : NODE_RADIUS;

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${nodeOp})`;
        ctx.fill();

        // Hovered ring
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.3)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${labelOp})`;
        ctx.fillText(n.name, n.x + r + 4, n.y);
      }

      rafId = requestAnimationFrame(draw);
    };

    // Respect reduced motion: static render
    if (prefersReducedMotion()) {
      resize();
      nodes = initNodes();
      // Single static draw
      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT;
      ctx.textBaseline = 'middle';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.7)`;
        ctx.fill();
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.5)`;
        ctx.fillText(n.name, n.x + NODE_RADIUS + 4, n.y);
      }
      return;
    }

    draw();

    const ro = new ResizeObserver(() => {
      resize();
      for (const n of nodes) {
        if (n.x > w - 40) n.x = Math.random() * (w - 80) + 40;
        if (n.y > h - 40) n.y = Math.random() * (h - 80) + 40;
      }
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
    };
  }, [isGeekMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'default' }}
      aria-label="Skill constellation visualization"
    />
  );
};
