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
      className="absolute inset-0 pointer-events-none -z-10"
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
                // NO mouse interaction - particles drift independently
                onHover: {
                  enable: false,
                },
                onClick: {
                  enable: false,
                },
                resize: {
                  enable: true,
                  delay: 0.5,
                },
              },
            },
            particles: {
              color: {
                value: ['#00f0ff', '#00ff88'], // Cyan and green glow
              },
              // Connection lines for network effect
              links: {
                enable: true,
                distance: 150, // Connect particles within 150px
                color: '#00f0ff', // Cyan lines
                opacity: 0.4, // Semi-transparent (0.3-0.5 range)
                width: 1, // 1px line thickness
                triangles: {
                  enable: false, // No triangular meshes, just lines
                },
                // Lines fade based on distance
                blink: false,
                consent: false,
                shadow: {
                  enable: false,
                },
              },
              move: {
                // Slow, smooth drift
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'out', // Particles leave and respawn
                },
                random: true, // Organic, varied movement
                speed: 0.2, // Very slow drift
                straight: false,
                attract: {
                  enable: false,
                },
                trail: {
                  enable: false,
                },
              },
              number: {
                density: {
                  enable: true,
                  width: 1920,
                  height: 1080,
                },
                value: 60, // 50-80 particles as specified
              },
              opacity: {
                value: {
                  min: 0.2,
                  max: 0.4,
                }, // 20-40% opacity - subtle
                animation: {
                  enable: true,
                  speed: 0.5,
                  sync: false,
                },
              },
              shape: {
                type: ['circle', 'square', 'triangle'], // Mix of geometric shapes
              },
              size: {
                value: {
                  min: 2,
                  max: 4,
                }, // Tiny: 2-4px
              },
              rotate: {
                value: {
                  min: 0,
                  max: 360,
                },
                animation: {
                  enable: true,
                  speed: 1, // Very slow rotation
                  sync: false,
                },
              },
              // Add subtle glow effect
              shadow: {
                enable: true,
                blur: 5,
                color: {
                  value: '#00f0ff',
                },
                offset: {
                  x: 0,
                  y: 0,
                },
              },
            },
            detectRetina: true,
            smooth: true,
            fullScreen: {
              enable: false,
              zIndex: -1,
            },
          }}
        />
      )}
    </div>
  );
};
