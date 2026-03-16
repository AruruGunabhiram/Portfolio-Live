import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '../components';
import { Skill3DSphere } from '../components/skills/Skill3DSphere';
import { SkillConstellation } from '../components/skills/SkillConstellation';
import { useTheme } from '../hooks';
import { fadeInUp, scrollViewport } from '../utils';
import { SKILLS } from '../data/resume';
import { SKILLS as SKILLS_DETAIL } from '../data/skills';

type SkillMode = 'grid' | 'constellation' | 'sphere';

const MODES: { id: SkillMode; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'sphere', label: '3D Sphere' },
];

// Flatten SKILLS_DETAIL for the 3D sphere component
const sphereSkills = SKILLS_DETAIL.map(s => ({ name: s.name, level: s.level ?? 50 }));

export const Skills = () => {
  const { isGeekMode } = useTheme();
  const [mode, setMode] = useState<SkillMode>('grid');

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const catLabel = isGeekMode ? 'text-[#4a8fa8]' : 'text-[#818cf8]';
  const skillTag = isGeekMode
    ? 'bg-[#0a1a22] text-[#8bbfd4] border border-[#2a5060]/50 hover:border-[#4a8fa8]/70 hover:text-[#a0d0e0]'
    : 'bg-[#1a1a30] text-gray-300 border border-gray-700/50 hover:border-gray-500/60';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/60 border border-[#2a5060]/40'
    : 'bg-[#141428]/60 border border-gray-700/30';

  const activeModeStyle = isGeekMode
    ? 'text-[#7ec0d6] border-b-2 border-[#5ba8c4]'
    : 'text-white border-b-2 border-[#818cf8]';
  const inactiveModeStyle = isGeekMode
    ? 'text-[#4a7a8a] hover:text-[#6aaabb] border-b-2 border-transparent'
    : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent';

  return (
    <section id="skills" className="py-20 relative">
      <Container>
        {/* Section title */}
        <motion.h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-8 ${accent}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}Technical Skills
        </motion.h2>

        {/* Mode switcher */}
        <motion.div
          className="flex gap-4 sm:gap-6 mb-10 border-b border-gray-800/50"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`pb-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                mode === m.id ? activeModeStyle : inactiveModeStyle
              }`}
            >
              {isGeekMode && mode === m.id ? `> ${m.label}` : m.label}
            </button>
          ))}
        </motion.div>

        {/* Mode panels */}
        <AnimatePresence mode="wait">
          {mode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {SKILLS.map(cat => (
                <div key={cat.id} className={`rounded-xl p-5 ${surface}`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${catLabel}`}>
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map(skill => (
                      <span
                        key={skill}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors duration-150 cursor-default ${skillTag}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {mode === 'constellation' && (
            <motion.div
              key="constellation"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`w-full rounded-xl overflow-hidden h-[300px] sm:h-[420px] md:h-[520px] ${surface}`}
            >
              <SkillConstellation isGeekMode={isGeekMode} />
            </motion.div>
          )}

          {mode === 'sphere' && (
            <motion.div
              key="sphere"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <Skill3DSphere skills={sphereSkills} isGeekMode={isGeekMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
};
