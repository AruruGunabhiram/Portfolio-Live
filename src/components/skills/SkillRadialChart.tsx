import { useEffect, useRef } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface SkillRadialChartProps {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
}

export const SkillRadialChart = ({ skills, isGeekMode }: SkillRadialChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2 - 40;
    const reducedMotion = prefersReducedMotion();

    let animationProgress = reducedMotion ? 1 : 0;
    let animationFrame: number;

    const animate = () => {
      if (animationProgress < 1) {
        animationProgress += 0.02;
        if (animationProgress > 1) animationProgress = 1;
      }

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      skills.forEach((skill, index) => {
        const angle = (index / skills.length) * 2 * Math.PI - Math.PI / 2;
        const radius = (skill.level / 100) * maxRadius * animationProgress;

        // Draw radial line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.strokeStyle = isGeekMode ? '#00ff00' : '#646cff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw endpoint circle
        ctx.beginPath();
        ctx.arc(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius,
          4,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = isGeekMode ? '#00ff00' : '#646cff';
        ctx.fill();

        // Draw skill label
        const labelRadius = maxRadius + 20;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;

        ctx.fillStyle = isGeekMode ? '#00ff00' : '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name, labelX, labelY);

        // Draw percentage
        ctx.font = '10px monospace';
        ctx.fillStyle = isGeekMode ? 'rgba(0,255,0,0.7)' : 'rgba(255,255,255,0.7)';
        ctx.fillText(`${skill.level}%`, labelX, labelY + 12);
      });

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = isGeekMode ? '#00ff00' : '#646cff';
      ctx.fill();

      // Draw reference circles
      [0.25, 0.5, 0.75, 1].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * fraction, 0, 2 * Math.PI);
        ctx.strokeStyle = isGeekMode ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      if (animationProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [skills, isGeekMode]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full"
        aria-label="Radial chart showing skill proficiency levels"
        role="img"
      />
    </div>
  );
};
