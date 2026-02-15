import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { SKILLS, fadeInUp, scrollViewport, useGSAP, isBrowser } from '../utils';

// Register GSAP plugin
if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger);
}

export const Skills = () => {
  const { isGeekMode } = useTheme();
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skillItemsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP ScrollTrigger animations
  useGSAP(() => {
    if (!isBrowser) return;

    // Animate category headers
    categoryRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.from(ref, {
          scrollTrigger: {
            trigger: ref,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: -30,
          duration: 0.6,
          delay: index * 0.1,
        });
      }
    });

    // Animate skill items with stagger
    const skillElements = skillItemsRefs.current.filter(Boolean);
    if (skillElements.length > 0) {
      gsap.from(skillElements, {
        scrollTrigger: {
          trigger: skillElements[0]?.parentElement,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }

    // Cleanup function
    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <section id="skills" className="py-20">
      <Container>
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-12 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Skills & Technologies
        </motion.h2>

        <div className="space-y-8">
          {Object.entries(SKILLS).map(([category, skills], categoryIndex) => (
            <div key={category}>
              <h3
                ref={(el) => { categoryRefs.current[categoryIndex] = el; }}
                className={`text-xl font-semibold mb-4 capitalize ${isGeekMode ? 'text-geek-text' : 'text-gray-200'}`}
              >
                {isGeekMode ? '> ' : ''}{category}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skills.map((skill, skillIndex) => {
                  const refIndex = categoryIndex * 10 + skillIndex;
                  return (
                    <div
                      key={skill}
                      ref={(el) => { skillItemsRefs.current[refIndex] = el; }}
                      className={`px-4 py-3 rounded-lg text-center ${isGeekMode ? 'bg-geek-accent/10 border border-geek-accent text-geek-text' : 'bg-dark-surface border border-gray-700 text-gray-300'}`}
                    >
                      {skill}
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
