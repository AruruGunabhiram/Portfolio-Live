import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface SkillBarsRoughProps {
  skills: Array<{ name: string; level: number }>;
  isGeekMode: boolean;
}

export const SkillBarsRough = ({ skills, isGeekMode }: SkillBarsRoughProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 800;
    const height = skills.length * 60 + 40;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const rc = rough.canvas(canvas);
    const reducedMotion = prefersReducedMotion();

    let animationProgress = reducedMotion ? 1 : 0;
    let animationFrame: number;

    const animate = () => {
      if (animationProgress < 1) {
        animationProgress += 0.02;
        if (animationProgress > 1) animationProgress = 1;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      skills.forEach((skill, index) => {
        const y = index * 60 + 30;
        const barWidth = 500;
        const barHeight = 30;
        const fillWidth = (skill.level / 100) * barWidth * animationProgress;

        // Draw skill name
        ctx.fillStyle = isGeekMode ? '#00f0ff' : '#fff';
        ctx.font = '14px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name, 20, y);

        // Draw percentage
        ctx.fillText(`${skill.level}%`, 20 + barWidth + 20, y);

        // Draw background bar with rough.js
        rc.rectangle(200, y - barHeight / 2, barWidth, barHeight, {
          stroke: isGeekMode ? '#00f0ff' : '#646cff',
          strokeWidth: 2,
          fill: 'rgba(0, 0, 0, 0.3)',
          fillStyle: 'solid',
          roughness: isGeekMode ? 0.5 : 1.5,
        });

        // Draw filled portion with rough.js
        if (fillWidth > 0) {
          rc.rectangle(200, y - barHeight / 2, fillWidth, barHeight, {
            stroke: isGeekMode ? '#00f0ff' : '#646cff',
            strokeWidth: 1,
            fill: isGeekMode ? '#00f0ff' : '#646cff',
            fillStyle: 'hachure',
            fillWeight: 2,
            hachureAngle: 45 + index * 10,
            hachureGap: 5,
            roughness: isGeekMode ? 0.5 : 1.5,
          });
        }
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
    <div className="flex justify-center overflow-x-auto">
      <canvas
        ref={canvasRef}
        className="max-w-full"
        aria-label="Hand-drawn style bar chart showing skill proficiency levels"
        role="img"
      />
    </div>
  );
};
