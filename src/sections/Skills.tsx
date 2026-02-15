import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container, ParallaxLayer } from '../components';
import { useTheme } from '../hooks';
import { SKILLS, fadeInUp, scrollViewport, useGSAP, isBrowser, prefersReducedMotion } from '../utils';

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export const Skills = () => {
  const { isGeekMode } = useTheme();
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skillBarsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP ScrollTrigger animations for skill bars
  useGSAP(() => {
    if (!isBrowser) return;

    const reducedMotion = prefersReducedMotion();

    // Animate category headers
    categoryRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.from(ref, {
          scrollTrigger: {
            trigger: ref,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: -30,
          duration: reducedMotion ? 0 : 0.6,
          delay: reducedMotion ? 0 : index * 0.1,
          ease: 'power2.out',
        });
      }
    });

    // Animate skill bars with fill effect
    skillBarsRefs.current.forEach((ref, index) => {
      if (ref) {
        const bar = ref.querySelector('.skill-bar-fill');
        const targetWidth = ref.getAttribute('data-level') || '0';

        if (bar) {
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: `${targetWidth}%`,
              scrollTrigger: {
                trigger: ref,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                scrub: reducedMotion ? false : 1, // Smooth scrubbing unless reduced motion
              },
              duration: reducedMotion ? 0 : 1.5,
              delay: reducedMotion ? 0 : index * 0.05,
              ease: 'power3.out',
            }
          );
        }
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Parallax Background Layer */}
      <ParallaxLayer speed={-10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <div className={`w-[600px] h-[600px] rounded-full ${isGeekMode ? 'bg-geek-accent' : 'bg-dark-accent'} blur-3xl`} />
      </ParallaxLayer>

      <Container className="relative z-10">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-12 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Skills & Technologies
        </motion.h2>

        <div className="space-y-12">
          {Object.entries(SKILLS).map(([category, skills], categoryIndex) => (
            <div key={category}>
              <h3
                ref={(el) => { categoryRefs.current[categoryIndex] = el; }}
                className={`text-xl font-semibold mb-6 capitalize ${isGeekMode ? 'text-geek-text' : 'text-gray-200'}`}
              >
                {isGeekMode ? '> ' : ''}{category}
              </h3>

              <div className="space-y-4">
                {skills.map((skill, skillIndex) => {
                  const refIndex = categoryIndex * 10 + skillIndex;
                  return (
                    <div
                      key={skill.name}
                      ref={(el) => { skillBarsRefs.current[refIndex] = el; }}
                      data-level={skill.level}
                      className="group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}>
                          {skill.name}
                        </span>
                        <span className={`text-sm ${isGeekMode ? 'text-geek-accent' : 'text-dark-accent'}`}>
                          {skill.level}%
                        </span>
                      </div>

                      {/* Skill Bar */}
                      <div className={`h-2 rounded-full overflow-hidden ${isGeekMode ? 'bg-geek-accent/20' : 'bg-dark-surface'}`}>
                        <div
                          className={`skill-bar-fill h-full rounded-full transition-all ${
                            isGeekMode
                              ? 'bg-geek-accent shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                              : 'bg-dark-accent'
                          }`}
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
