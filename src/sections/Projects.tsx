import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container, Card, Button, ParallaxLayer } from '../components';
import { useTheme } from '../hooks';
import {
  PROJECTS,
  fadeInUp,
  scrollViewport,
  useGSAP,
  isBrowser,
  prefersReducedMotion,
} from '../utils';

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export const Projects = () => {
  const { isGeekMode } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Horizontal Scroll with pinning
  useGSAP(() => {
    if (!isBrowser || !scrollContainerRef.current || !sectionRef.current) return;

    const reducedMotion = prefersReducedMotion();

    // Skip horizontal scroll if reduced motion is preferred
    if (reducedMotion) return;

    const scrollContainer = scrollContainerRef.current;
    const cards = scrollContainer.querySelectorAll('.project-card');

    // Calculate total scroll width
    const scrollWidth = scrollContainer.scrollWidth - window.innerWidth;

    // Horizontal scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Animate horizontal scroll
    tl.to(scrollContainer, {
      x: -scrollWidth,
      ease: 'none',
    });

    // Animate individual cards
    cards.forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'left 80%',
          end: 'left 20%',
          scrub: 1,
          containerAnimation: tl,
        },
        opacity: 0,
        scale: 0.8,
        ease: 'power2.out',
      });
    });

    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <ParallaxLayer speed={-12} className="absolute top-20 right-20 opacity-10">
        <div className={`w-80 h-80 rounded-full ${isGeekMode ? 'bg-geek-accent' : 'bg-dark-accent'} blur-3xl`} />
      </ParallaxLayer>

      <Container className="relative z-10">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-12 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Featured Projects
        </motion.h2>

        {/* Scroll Hint */}
        {!prefersReducedMotion() && (
          <p className={`text-sm mb-6 ${isGeekMode ? 'text-geek-text/60' : 'text-gray-500'}`}>
            ← Scroll to explore projects →
          </p>
        )}
      </Container>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 px-4 sm:px-6 lg:px-8"
        style={{ width: 'max-content' }}
      >
        {PROJECTS.map((project) => (
          <article
            key={project.id}
            className="project-card"
            style={{ width: '400px', maxWidth: '90vw' }}
          >
            <Card>
              <h3 className={`text-xl font-bold mb-3 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}>
                {isGeekMode ? '> ' : ''}{project.title}
              </h3>

              <p className={`mb-4 ${isGeekMode ? 'text-geek-text/80' : 'text-gray-400'}`}>
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className={`text-sm px-3 py-1 rounded ${
                      isGeekMode
                        ? 'bg-geek-accent/20 text-geek-accent border border-geek-accent'
                        : 'bg-dark-accent/20 text-dark-accent'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                {project.githubUrl && (
                  <Button
                    variant="ghost"
                    className="text-sm px-4 py-2"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    GitHub
                  </Button>
                )}
                {project.liveUrl && (
                  <Button
                    variant="ghost"
                    className="text-sm px-4 py-2"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    Live Demo
                  </Button>
                )}
              </div>
            </Card>
          </article>
        ))}
      </div>

      {/* Spacer for scroll height when reduced motion is disabled */}
      {!prefersReducedMotion() && (
        <div style={{ height: '50vh' }} aria-hidden="true" />
      )}
    </section>
  );
};
