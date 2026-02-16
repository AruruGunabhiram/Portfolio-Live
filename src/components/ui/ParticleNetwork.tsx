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
                // Mouse interaction: repulsion effect (push particles away)
                onHover: {
                  enable: true,
                  mode: 'repulse', // Particles move away from cursor
                },
                onClick: {
                  enable: false,
                },
                resize: {
                  enable: true,
                  delay: 0.5,
                },
              },
              modes: {
                repulse: {
                  distance: 100, // Repulsion radius: 100px from cursor
                  duration: 0.4, // Smooth transition duration
                  speed: 1, // Repulsion speed
                  factor: 3, // Repulsion strength
                  easing: 'ease-out-quad', // Smooth easing
                  maxSpeed: 50, // Max repulsion velocity
                },
              },
            },
            particles: {
              color: {
                value: ['#00f0ff', '#00ff88'], // Cyan and green glow
              },
              // Connection lines for network effect (dynamic breaking/reconnecting)
              links: {
                enable: true,
                distance: 150, // Connect particles within 150px
                color: '#00f0ff', // Cyan lines
                opacity: 0.4, // Semi-transparent
                width: 1, // 1px line thickness
                triangles: {
                  enable: false, // No triangular meshes
                },
                // Lines fade based on distance (closer = more opaque)
                blink: false,
                consent: false,
                shadow: {
                  enable: false,
                },
                // Lines break when mouse is nearby (creates "mouse cuts through network" effect)
                warp: true,
              },
              move: {
                // Random movement in all directions (like reference video)
                direction: 'none', // No fixed direction - completely random
                enable: true,
                outModes: {
                  default: 'bounce', // Bounce off edges (boundary bounce)
                },
                random: true, // Randomize movement for organic motion
                speed: 0.5, // Increased from 0.2 for more noticeable movement
                straight: false, // Curved, organic paths
                attract: {
                  enable: false,
                },
                trail: {
                  enable: false,
                },
                vibrate: false,
                bounce: true, // Enable boundary bouncing
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
