import { useEffect, useRef, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, Container } from '@tsparticles/engine';
import { isBrowser, prefersReducedMotion } from '../../utils';

export const ParticleNetwork = () => {
  const [init, setInit] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Container | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  useEffect(() => {
    if (!isBrowser || !containerRef.current) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!particlesRef.current) return;
        if (entry.isIntersecting) particlesRef.current.play();
        else particlesRef.current.pause();
      });
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) particlesRef.current = container;
  }, []);

  if (prefersReducedMotion()) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none -z-10">
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: 'transparent' } },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: 'repulse' },
                onClick: { enable: false },
                resize: { enable: true, delay: 0.5 },
              },
              modes: {
                repulse: { distance: 80, duration: 0.4, speed: 0.8, factor: 2, easing: 'ease-out-quad' },
              },
            },
            particles: {
              color: { value: ['#4a8fa8', '#3d7a94', '#5ba8c4'] },
              links: {
                enable: true,
                distance: 140,
                color: '#3d7a94',
                opacity: 0.25,
                width: 0.8,
                warp: false,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                random: true,
                speed: 0.7,
                straight: false,
                bounce: true,
              },
              number: {
                density: { enable: true, width: 1920, height: 1080 },
                value: 55,
              },
              opacity: {
                value: 0.35,
                random: { enable: true, minimumValue: 0.15 },
                animation: { enable: true, speed: 0.6, sync: false, minimumValue: 0.1 },
              },
              shape: { type: 'circle' },
              size: {
                value: 2,
                random: { enable: true, minimumValue: 1 },
                animation: { enable: false },
              },
              shadow: { enable: false },
            },
            detectRetina: true,
            smooth: true,
            fullScreen: { enable: false, zIndex: -1 },
          }}
        />
      )}
    </div>
  );
};
