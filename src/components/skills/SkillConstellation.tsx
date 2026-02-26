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

// ─── Motion & interaction constants ──────────────────────────────────────────
const MAX_DIST = 160;          // px — max edge connection distance
const NODE_RADIUS = 4;
const HOVER_RADIUS = 22;       // px — node hover detection radius
const FRICTION = 0.988;        // velocity damping per frame (keeps motion smooth)
const MAX_SPEED = 1.1;         // px/frame — velocity cap
const NOISE_STRENGTH = 0.011;  // random walk magnitude per frame (organic feel)
const REPEL_RADIUS = 90;       // px — cursor repels nodes within this radius
const REPEL_STRENGTH = 0.52;   // repulsion impulse magnitude
const EDGE_SPLIT_RADIUS = 58;  // px — cursor within this distance of a segment triggers split
const GHOST_PUSH = 42;         // px — max offset of the split ghost point away from cursor
const BREATH_SPEED = 0.00055;  // rad/ms — edge breathing cycle speed (~11s full cycle)

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

    // Flatten skills from resume data
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
        // Initial velocity: slow drift, varied direction
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
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
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', onMouseLeave);

    const FONT = isGeekMode
      ? "10px 'Courier New', monospace"
      : '10px -apple-system, BlinkMacSystemFont, sans-serif';

    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const margin = 40;
      const mx = mouse.x;
      const my = mouse.y;
      const hasMouseOnCanvas = mx > -1000;
      const now = performance.now();

      // ─── 1. Physics update ──────────────────────────────────────────────────
      for (const n of nodes) {
        // Organic random walk — prevents perfectly straight drift
        n.vx += (Math.random() - 0.5) * NOISE_STRENGTH;
        n.vy += (Math.random() - 0.5) * NOISE_STRENGTH;

        // Cursor repulsion applied to velocity (gentle, persistent push)
        if (hasMouseOnCanvas) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS && dist > 1) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        // Friction damping
        n.vx *= FRICTION;
        n.vy *= FRICTION;

        // Speed cap
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > MAX_SPEED) {
          n.vx = (n.vx / speed) * MAX_SPEED;
          n.vy = (n.vy / speed) * MAX_SPEED;
        }

        // Position update with wall bounce
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < margin) { n.x = margin; n.vx = Math.abs(n.vx); }
        else if (n.x > w - margin) { n.x = w - margin; n.vx = -Math.abs(n.vx); }
        if (n.y < margin) { n.y = margin; n.vy = Math.abs(n.vy); }
        else if (n.y > h - margin) { n.y = h - margin; n.vy = -Math.abs(n.vy); }
      }

      // ─── 2. Hovered node detection ──────────────────────────────────────────
      hoveredIndex = -1;
      if (hasMouseOnCanvas) {
        for (let i = 0; i < nodes.length; i++) {
          if (Math.hypot(nodes[i].x - mx, nodes[i].y - my) < HOVER_RADIUS) {
            hoveredIndex = i;
            break;
          }
        }
      }
      const hasHover = hoveredIndex !== -1;

      // ─── 3. Draw edges with breathing + cursor split/rewire ─────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const abx = b.x - a.x;
          const aby = b.y - a.y;
          const dist2 = abx * abx + aby * aby;
          if (dist2 >= MAX_DIST * MAX_DIST) continue;
          const dist = Math.sqrt(dist2);

          // Base opacity calculation (same logic as before)
          const isConnectedToHover =
            hasHover && (i === hoveredIndex || j === hoveredIndex);
          const baseFraction = 1 - dist / MAX_DIST;
          let baseOp: number;
          if (!hasHover) {
            baseOp = baseFraction * 0.30;
          } else if (isConnectedToHover) {
            baseOp = baseFraction * 0.72;
          } else {
            baseOp = baseFraction * 0.06;
          }
          if (baseOp < 0.008) continue;

          // Per-pair breathing phase — deterministic, no allocation
          const phase = i * 7.31 + j * 13.07;
          const breathe = 0.6 + 0.4 * Math.sin(now * BREATH_SPEED + phase);

          // ─── Cursor-proximity split/ghost-point calculation ─────────────────
          // Find closest point P on segment A→B to cursor M via projection.
          // t ∈ [0,1] parameterises the position along the segment.
          let splitFactor = 0;
          let ghostX = a.x + abx * 0.5; // default: midpoint
          let ghostY = a.y + aby * 0.5;

          if (hasMouseOnCanvas) {
            const acx = mx - a.x;
            const acy = my - a.y;
            const t = clamp((acx * abx + acy * aby) / (dist2 + 0.001), 0, 1);
            const cpX = a.x + t * abx; // closest point on segment
            const cpY = a.y + t * aby;
            const segDistSq = (mx - cpX) ** 2 + (my - cpY) ** 2;
            const segDist = Math.sqrt(segDistSq);

            if (segDist < EDGE_SPLIT_RADIUS) {
              splitFactor = 1 - segDist / EDGE_SPLIT_RADIUS;
              // Push ghost point away from cursor along the cursor→closestPoint vector
              const dxCP = cpX - mx;
              const dyCP = cpY - my;
              const dLen = Math.sqrt(dxCP * dxCP + dyCP * dyCP) + 0.001;
              ghostX = cpX + (dxCP / dLen) * splitFactor * GHOST_PUSH;
              ghostY = cpY + (dyCP / dLen) * splitFactor * GHOST_PUSH;
            }
          }

          const lw = isConnectedToHover ? 1.2 : 0.75;
          const [r, g, bl] = [91, 168, 196]; // teal

          if (splitFactor > 0.02) {
            // Split mode: draw A→ghost + ghost→B; opacity fades as split deepens
            const splitOp = baseOp * (1 - splitFactor * 0.42) * breathe;
            if (splitOp > 0.005) {
              ctx.strokeStyle = `rgba(${r},${g},${bl},${splitOp.toFixed(3)})`;
              ctx.lineWidth = lw;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(ghostX, ghostY);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(ghostX, ghostY);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          } else {
            // Normal mode: straight A→B with breathing opacity
            const op = baseOp * breathe;
            if (op > 0.007) {
              ctx.strokeStyle = `rgba(${r},${g},${bl},${op.toFixed(3)})`;
              ctx.lineWidth = lw;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      // ─── 4. Draw nodes + labels ─────────────────────────────────────────────
      ctx.font = FONT;
      ctx.textBaseline = 'middle';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hoveredIndex;
        const isDimmed = hasHover && !isHovered;

        const nodeOp = isDimmed ? 0.25 : isHovered ? 1 : 0.75;
        const labelOp = isDimmed ? 0.18 : isHovered ? 1 : 0.55;
        const r = isHovered ? NODE_RADIUS + 2 : NODE_RADIUS;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${nodeOp})`;
        ctx.fill();

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0.3)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${labelOp})`;
        ctx.fillText(n.name, n.x + r + 4, n.y);
      }

      rafId = requestAnimationFrame(draw);
    };

    // Respect reduced motion: single static render, no animation
    if (prefersReducedMotion()) {
      resize();
      nodes = initNodes();
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
