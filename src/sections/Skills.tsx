import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '../components';
import { Skill3DSphere } from '../components/skills/Skill3DSphere';
import { SkillConstellation } from '../components/skills/SkillConstellation';
import { fadeInUp, scrollViewport } from '../utils';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';

type SkillMode = 'grid' | 'constellation' | 'sphere';

const MODES: { id: SkillMode; label: string }[] = [
  { id: 'grid', label: 'Grid' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'sphere', label: '3D Sphere' },
];

export const Skills = () => {
  const [mode, setMode] = useState<SkillMode>('grid');

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SKILLS>();
    for (const cat of SKILL_CATEGORIES) {
      map.set(cat.id, SKILLS.filter(s => s.category === cat.id));
    }
    return map;
  }, []);

  const sphereSkills = useMemo(() => SKILLS.map(s => ({ name: s.name, level: 50 })), []);

  return (
    <section id="skills" className="py-20 relative">
      <Container>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 tracking-tight"
          style={{ color: 'var(--text)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          Technical Skills
        </motion.h2>

        <motion.div
          className="flex gap-4 sm:gap-6 mb-10 border-b"
          style={{ borderColor: 'var(--border)' }}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="pb-2.5 text-sm font-medium tracking-wide transition-colors"
              style={{
                color: mode === m.id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: mode === m.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {m.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {SKILL_CATEGORIES.map(cat => {
                const skills = grouped.get(cat.id) ?? [];
                return (
                  <div
                    key={cat.id}
                    className="rounded-md p-5"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
                      {cat.label}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(skill => (
                        <span
                          key={skill.id}
                          className="text-xs px-2.5 py-1 rounded-md border"
                          style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {mode === 'constellation' && (
            <motion.div
              key="constellation"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="w-full rounded-md overflow-hidden h-[300px] sm:h-[420px] md:h-[520px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <SkillConstellation isGeekMode={false} />
            </motion.div>
          )}

          {mode === 'sphere' && (
            <motion.div
              key="sphere"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <Skill3DSphere skills={sphereSkills} isGeekMode={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
};
