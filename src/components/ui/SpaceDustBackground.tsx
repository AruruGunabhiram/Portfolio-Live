import { useEffect, useRef } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  isTeal: boolean;
}

const COUNT = 260;
const CONNECT_DIST = 90;
const MAX_CONNECT_OPACITY = 0.11;
const PARALLAX = 7; // max pixel shift on mouse

export const SpaceDustBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isBrowser || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    let rafId = 0;
    const mouse = { x: 0.5, y: 0.5 }; // normalized 0-1
    let particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const mkParticle = (): Particle => {
      const isTeal = Math.random() < 0.28;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.1 + 0.7,
        opacity: Math.random() * 0.28 + 0.07,
        isTeal,
      };
    };

    resize();
    particles = Array.from({ length: COUNT }, mkParticle);

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const ox = (mouse.x - 0.5) * PARALLAX;
      const oy = (mouse.y - 0.5) * PARALLAX;

      // Update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -12) p.x = w + 12;
        else if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        else if (p.y > h + 12) p.y = -12;
      }

      // Draw connection lines (only between teal particles to reduce visual noise)
      const teal = particles.filter(p => p.isTeal);
      for (let i = 0; i < teal.length; i++) {
        for (let j = i + 1; j < teal.length; j++) {
          const a = teal[i], b = teal[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const op = MAX_CONNECT_OPACITY * (1 - dist / CONNECT_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x + ox, a.y + oy);
            ctx.lineTo(b.x + ox, b.y + oy);
            ctx.strokeStyle = `rgba(91,168,196,${op.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of particles) {
        const px = p.x + ox;
        const py = p.y + oy;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        if (p.isTeal) {
          ctx.fillStyle = `rgba(91,168,196,${p.opacity.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(216,230,238,${p.opacity.toFixed(3)})`;
        }
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(() => {
      resize();
      // Clamp particle positions to new size
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
