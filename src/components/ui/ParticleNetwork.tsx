import { useEffect, useRef, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, Container } from '@tsparticles/engine';
import { isBrowser, prefersReducedMotion } from '../../utils';

export const ParticleNetwork = () => {
  const [init, setInit] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<Container | null>(null);

  // Initialize particles engine
  useEffect(() => {
    if (!isBrowser) return;

    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    if (!isBrowser || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);

          // Pause/play particles based on visibility
          if (particlesContainerRef.current) {
            if (entry.isIntersecting) {
              particlesContainerRef.current.play();
            } else {
              particlesContainerRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      particlesContainerRef.current = container;
    }
  }, []);

  // Don't render if reduced motion is preferred
  if (prefersReducedMotion()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: isVisible ? 1 : 0.3 }}
    >
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: 'transparent',
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'repulse',
                },
                resize: {
                  enable: true,
                  delay: 0.5,
                },
              },
              modes: {
                repulse: {
                  distance: 100,
                  duration: 0.4,
                  speed: 1,
                },
              },
            },
            particles: {
              color: {
                value: '#00ff00',
              },
              links: {
                color: '#00ff00',
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 1920,
                  height: 1080,
                },
                value: 80, // Limited for performance
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
            smooth: true,
            fullScreen: {
              enable: false,
              zIndex: 0,
            },
          }}
        />
      )}
    </div>
  );
};
