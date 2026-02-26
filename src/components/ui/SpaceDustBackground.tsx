import { useEffect, useRef } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;           // base radius
  opacity: number;     // base opacity
  isTeal: boolean;
  z: number;           // depth: 0 = far background, 1 = close foreground
  vz: number;          // z-axis drift velocity
}

// ─── Particle count + parallax ────────────────────────────────────────────────
const COUNT    = 260;
const PARALLAX = 7;           // max px shift at z=0

// ─── Dotted network — tune these ─────────────────────────────────────────────
const MIN_LINE_DIST      = 25;     // px — skip micro-connections (noisy)
const MAX_LINE_DIST      = 150;    // px — connection reach
const MIN_LINE_DIST_SQ   = MIN_LINE_DIST * MIN_LINE_DIST;
const MAX_LINE_DIST_SQ   = MAX_LINE_DIST * MAX_LINE_DIST;
const DASH               = 3;     // dash length (canvas px)
const GAP                = 5;     // gap length
const LINE_ALPHA_MIN     = 0.13;  // floor: far edges visible when you look
const LINE_ALPHA_BOOST   = 0.32;  // quadratic boost for near edges
const LINE_ALPHA_MAX     = 0.45;  // cap: near edges clear but not dominating
const LINE_WIDTH         = 0.8;   // stroke width (CSS px)
const MAX_EPP            = 4;     // max edges per particle — density knob
const MAX_TOTAL_EDGES    = 500;   // hard frame cap

// ─── Hover split / reattach ───────────────────────────────────────────────────
const HOVER_DIST    = 28;   // px cursor→segment distance that triggers a split
const HOVER_DIST_SQ = HOVER_DIST * HOVER_DIST;
const BLOCK_MS      = 750;  // how long a split edge stays hidden before rewiring

// ─── Teal solid lines (original, unchanged) ───────────────────────────────────
const CONNECT_DIST  = 90;
const MAX_CONNECT_OP = 0.07;

// ─── Depth constants (unchanged) ─────────────────────────────────────────────
const ACTIVE_DEPTH_RATIO = 0.15;
const ACTIVE_VZ   = 0.00055;
const PASSIVE_VZ  = 0.00008;
const Z_SCALE_MIN = 0.45;
const Z_SCALE_MAX = 1.40;
const Z_ALPHA_MIN = 0.50;
const Z_ALPHA_MAX = 1.20;
const Z_PARALLAX_MIN = 0.4;
const Z_PARALLAX_MAX = 2.0;

// ─── Spatial grid cell size ───────────────────────────────────────────────────
const CELL = MAX_LINE_DIST;   // one cell = one connection radius

// ─── Utility: squared distance from point P to segment AB ────────────────────
function ptSegDistSq(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (ax + t * dx - px) ** 2 + (ay + t * dy - py) ** 2;
}

export const SpaceDustBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isBrowser || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0, rafId = 0;

    const mouse  = { x: 0.5, y: 0.5 }; // normalized (0-1) for parallax
    const cursor = { x: -9999, y: -9999 }; // CSS px for hover detection

    let particles: Particle[] = [];

    // blocked edges: key = i * COUNT + j (always i < j), value = expiry timestamp
    const blocked = new Map<number, number>();

    // spatial grid: key = cellX * 65536 + cellY
    const grid = new Map<number, number[]>();

    // ── Resize ─────────────────────────────────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ── Particle factory (unchanged) ───────────────────────────────────────────
    const mkParticle = (): Particle => {
      const isTeal    = Math.random() < 0.28;
      const isActive  = Math.random() < ACTIVE_DEPTH_RATIO;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.1 + 0.7,
        opacity: Math.random() * 0.28 + 0.07,
        isTeal,
        z: Math.random(),
        vz: isActive
          ? (Math.random() - 0.5) * 2 * ACTIVE_VZ
          : (Math.random() - 0.5) * 2 * PASSIVE_VZ,
      };
    };

    resize();
    particles = Array.from({ length: COUNT }, mkParticle);

    // ── Events ─────────────────────────────────────────────────────────────────
    const onMouse = (e: MouseEvent) => {
      mouse.x  = e.clientX / window.innerWidth;
      mouse.y  = e.clientY / window.innerHeight;
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // ── Dev debug (throttled to every 2 s) ─────────────────────────────────────
    let dbgFrames = 0, dbgEdges = 0, dbgNext = 0;

    // ── Main draw loop ─────────────────────────────────────────────────────────
    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, w, h);

      const ox = (mouse.x - 0.5) * PARALLAX;
      const oy = (mouse.y - 0.5) * PARALLAX;

      // ── 1. Update particle positions + depth ────────────────────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -12) p.x = w + 12;
        else if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        else if (p.y > h + 12) p.y = -12;

        p.z += p.vz;
        if (p.z > 1) { p.z = 1; p.vz = -Math.abs(p.vz); }
        else if (p.z < 0) { p.z = 0;  p.vz = Math.abs(p.vz); }
      }

      // ── 2. Rebuild spatial grid (O(n) each frame) ────────────────────────────
      grid.clear();
      for (let i = 0; i < COUNT; i++) {
        const p  = particles[i];
        const cx = Math.floor(p.x / CELL);
        const cy = Math.floor(p.y / CELL);
        const k  = cx * 65536 + cy;
        let bucket = grid.get(k);
        if (!bucket) { bucket = []; grid.set(k, bucket); }
        bucket.push(i);
      }

      // ── 3. Precompute parallax-adjusted screen positions ─────────────────────
      //    (CSS px space — same space as cursor.x/y)
      const sx = new Float32Array(COUNT);
      const sy = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        const p  = particles[i];
        const pm = Z_PARALLAX_MIN + p.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN);
        sx[i] = p.x + ox * pm;
        sy[i] = p.y + oy * pm;
      }

      // ── 4. Expire old blocked edges ──────────────────────────────────────────
      for (const [k, expiry] of blocked) {
        if (now >= expiry) blocked.delete(k);
      }

      // ── 5. Draw dotted network lines ─────────────────────────────────────────
      ctx.setLineDash([DASH, GAP]);
      ctx.lineWidth    = 0.9;
      ctx.globalAlpha  = 1;

      let totalEdges = 0;
      const edgeCounts = new Uint8Array(COUNT); // edges drawn per particle

      for (let i = 0; i < COUNT && totalEdges < MAX_TOTAL_EDGES; i++) {
        if (edgeCounts[i] >= MAX_EPP) continue;

        const p  = particles[i];
        const cx = Math.floor(p.x / CELL);
        const cy = Math.floor(p.y / CELL);
        const ax = sx[i];
        const ay = sy[i];

        // Check the 3×3 neighborhood of cells
        outer: for (let dcy = -1; dcy <= 1; dcy++) {
          for (let dcx = -1; dcx <= 1; dcx++) {
            const bucket = grid.get((cx + dcx) * 65536 + (cy + dcy));
            if (!bucket) continue;

            for (const j of bucket) {
              if (j <= i) continue;                       // canonical i < j
              if (edgeCounts[i] >= MAX_EPP) break outer; // i is full
              if (edgeCounts[j] >= MAX_EPP) continue;    // j is full
              if (totalEdges >= MAX_TOTAL_EDGES) break outer;

              const dx = p.x - particles[j].x;
              const dy = p.y - particles[j].y;
              const distSq = dx * dx + dy * dy;
              if (distSq < MIN_LINE_DIST_SQ) continue;  // too short — skip noisy micro-edges
              if (distSq >= MAX_LINE_DIST_SQ) continue;

              const dist = Math.sqrt(distSq);
              const t    = 1 - dist / MAX_LINE_DIST;     // 1 = near, 0 = far
              // quadratic falloff — mid-range lines stay readable, no depth penalty
              const op = Math.min(LINE_ALPHA_MAX, LINE_ALPHA_MIN + t * t * LINE_ALPHA_BOOST);
              if (op < 0.01) continue;

              const bx = sx[j];
              const by = sy[j];

              // Hover split: check if cursor is near this segment
              const edgeKey = i * COUNT + j;
              if (blocked.has(edgeKey)) continue; // currently split — skip; neighbor edges fill in

              if (cursor.x > -1000) {
                const d2 = ptSegDistSq(cursor.x, cursor.y, ax, ay, bx, by);
                if (d2 < HOVER_DIST_SQ) {
                  blocked.set(edgeKey, now + BLOCK_MS); // split it
                  continue; // don't draw this frame
                }
              }

              // Star-shine gradient: transparent at both ends, bright at center
              // Each line twinkles independently via a unique phase offset
              const phase   = (i * 17 + j * 31) * 0.04;
              const twinkle = 0.72 + 0.28 * Math.sin(now * 0.0011 + phase);
              const peak    = op * twinkle;
              const grad    = ctx.createLinearGradient(ax, ay, bx, by);
              grad.addColorStop(0,    `rgba(210,228,255,0)`);
              grad.addColorStop(0.3,  `rgba(210,228,255,${(peak * 0.55).toFixed(3)})`);
              grad.addColorStop(0.5,  `rgba(210,228,255,${peak.toFixed(3)})`);
              grad.addColorStop(0.7,  `rgba(210,228,255,${(peak * 0.55).toFixed(3)})`);
              grad.addColorStop(1,    `rgba(210,228,255,0)`);
              ctx.strokeStyle = grad;
              ctx.lineWidth   = LINE_WIDTH;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.stroke();

              edgeCounts[i]++;
              edgeCounts[j]++;
              totalEdges++;
            }
          }
        }
      }

      // Reset dash before solid lines
      ctx.setLineDash([]);

      // Dev debug: log avg edges/frame every 2 s
      if (import.meta.env.DEV) {
        dbgEdges += totalEdges;
        dbgFrames++;
        if (now > dbgNext) {
          console.log(
            `[SpaceDust] edges/frame: ${Math.round(dbgEdges / dbgFrames)} | blocked: ${blocked.size}`
          );
          dbgEdges = dbgFrames = 0;
          dbgNext = now + 2000;
        }
      }

      // ── 6. Teal solid connections (unchanged logic) ──────────────────────────
      const teal = particles.filter(p => p.isTeal);
      for (let i = 0; i < teal.length; i++) {
        for (let j = i + 1; j < teal.length; j++) {
          const a = teal[i], b = teal[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= CONNECT_DIST) continue;

          const avgZ       = (a.z + b.z) * 0.5;
          const depthFactor = Z_ALPHA_MIN + avgZ * (Z_ALPHA_MAX - Z_ALPHA_MIN);
          const op = MAX_CONNECT_OP * (1 - dist / CONNECT_DIST) * depthFactor;

          const pxA = a.x + ox * (Z_PARALLAX_MIN + a.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN));
          const pyA = a.y + oy * (Z_PARALLAX_MIN + a.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN));
          const pxB = b.x + ox * (Z_PARALLAX_MIN + b.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN));
          const pyB = b.y + oy * (Z_PARALLAX_MIN + b.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN));

          ctx.beginPath();
          ctx.moveTo(pxA, pyA);
          ctx.lineTo(pxB, pyB);
          ctx.strokeStyle = `rgba(91,168,196,${op.toFixed(3)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }

      // ── 7. Draw particles on top (unchanged) ─────────────────────────────────
      for (const p of particles) {
        const zScale = Z_SCALE_MIN + p.z * (Z_SCALE_MAX - Z_SCALE_MIN);
        const zAlpha = Z_ALPHA_MIN + p.z * (Z_ALPHA_MAX - Z_ALPHA_MIN);
        const effectiveR  = p.r * zScale;
        const effectiveOp = Math.min(0.92, p.opacity * zAlpha);
        const pm = Z_PARALLAX_MIN + p.z * (Z_PARALLAX_MAX - Z_PARALLAX_MIN);
        const px = p.x + ox * pm;
        const py = p.y + oy * pm;

        ctx.beginPath();
        ctx.arc(px, py, effectiveR, 0, Math.PI * 2);
        ctx.fillStyle = p.isTeal
          ? `rgba(91,168,196,${effectiveOp.toFixed(3)})`
          : `rgba(216,230,238,${effectiveOp.toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(() => {
      resize();
      for (const p of particles) {
        if (p.x > w) p.x = Math.random() * w;
        if (p.y > h) p.y = Math.random() * h;
      }
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouse);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}
    />
  );
};
