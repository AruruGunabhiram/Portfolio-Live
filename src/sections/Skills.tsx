import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../components';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';
import { PROJECTS } from '../data/projects';
import { EXPERIENCE } from '../data/experience';
import { PUBLICATIONS } from '../data/publications';
import { CERTIFICATIONS } from '../data/certifications';
import { LEADERSHIP } from '../data/leadership';
import { prefersReducedMotion } from '../utils';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import type { SkillEvidence } from '../types/portfolio';

type ResolvedEvidence = {
  label: string;
  typeLabel: string;
  href?: string;
  externalUrl?: string;
};

function resolveEvidence(ev: SkillEvidence): ResolvedEvidence | null {
  switch (ev.type) {
    case 'project': {
      const p = PROJECTS.find(x => x.id === ev.id);
      if (!p) return null;
      return { label: p.title, typeLabel: 'Project', href: '#projects' };
    }
    case 'experience': {
      const e = EXPERIENCE.find(x => x.id === ev.id);
      if (!e) return null;
      return { label: e.companyShort ?? e.company, typeLabel: 'Experience', href: '#experience' };
    }
    case 'publication': {
      const pub = PUBLICATIONS.find(x => x.id === ev.id);
      if (!pub) return null;
      return { label: `${pub.venue} · ${pub.year}`, typeLabel: 'Publication', href: '#publications' };
    }
    case 'certification': {
      const c = CERTIFICATIONS.find(x => x.id === ev.id);
      if (!c) return null;
      return { label: c.title, typeLabel: 'Certification', href: '#certifications' };
    }
    case 'leadership': {
      const l = LEADERSHIP.find(x => x.id === ev.id);
      if (!l) return null;
      return { label: l.organization, typeLabel: 'Leadership', href: '#leadership' };
    }
    default:
      return null;
  }
}

export const Skills = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;
  const { isRecruiter } = usePortfolioMode();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SKILLS>();
    for (const cat of SKILL_CATEGORIES) {
      const list = SKILLS.filter(s => s.category === cat.id);
      if (list.length) map.set(cat.id, list);
    }
    return map;
  }, []);

  const selectedSkill = useMemo(() => (selectedId ? SKILLS.find(s => s.id === selectedId) ?? null : null), [selectedId]);

  const resolved = useMemo(() => {
    if (!selectedSkill?.evidence?.length) return [];
    return selectedSkill.evidence.map(resolveEvidence).filter((v): v is ResolvedEvidence => v !== null);
  }, [selectedSkill]);

  // group resolved by typeLabel for cleaner panel
  const groupedEvidence = useMemo(() => {
    const m = new Map<string, ResolvedEvidence[]>();
    for (const r of resolved) {
      const arr = m.get(r.typeLabel) ?? [];
      arr.push(r);
      m.set(r.typeLabel, arr);
    }
    return m;
  }, [resolved]);

  if (!SKILLS.length) return null;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.03 } },
  };
  const item = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.34, ease: 'easeOut' as const } },
  };

  return (
    <section id="skills" className="py-16 sm:py-20 relative">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
          variants={container}
        >
          <motion.h2
            variants={item}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Skills
          </motion.h2>
          <motion.p variants={item} className="text-sm leading-relaxed mt-2 max-w-[60ch]" style={{ color: 'var(--text-muted)' }}>
            Technologies tied to actual work.
          </motion.p>
          <motion.div variants={item} className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />

          {isRecruiter ? (
            <motion.div variants={item} className="mt-8 space-y-6">
              {SKILL_CATEGORIES.map(cat => {
                const list = grouped.get(cat.id);
                if (!list) return null;
                const withEvidence = list.filter(s => s.evidence?.length);
                const withoutEvidence = list.filter(s => !s.evidence?.length);
                // Order evidence-backed first for recruiter (no score, just evidence frequency)
                const ordered = [...withEvidence, ...withoutEvidence];
                return (
                  <div key={cat.id} className="min-w-0">
                    <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                      {cat.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {ordered.map(s => s.name).join(' · ')}
                    </p>
                    {withEvidence.length > 0 && (
                      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {withEvidence
                          .slice(0, 2)
                          .map(s => {
                            const ev = s.evidence!.map(resolveEvidence).filter((v): v is ResolvedEvidence => v !== null);
                            const labels = ev.map(e => e.label).join(' · ');
                            return `${s.name} — ${labels}`;
                          })
                          .join('  ·  ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="mt-8 sm:mt-10 grid lg:grid-cols-[1.6fr_0.9fr] gap-8 lg:gap-10 items-start">
              {/* Left — categories + skill controls */}
              <div className="min-w-0 space-y-7">
                {SKILL_CATEGORIES.map(cat => {
                  const list = grouped.get(cat.id);
                  if (!list) return null;
                  return (
                    <motion.div key={cat.id} variants={item} className="min-w-0">
                      <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                        {cat.label}
                      </h3>
                      <div className="mt-3 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {list.map(skill => {
                          const isSelected = selectedId === skill.id;
                          const hasEvidence = !!skill.evidence?.length;
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              aria-pressed={isSelected}
                              aria-label={`${skill.name}${hasEvidence ? ', has evidence' : ''}`}
                              onClick={() => setSelectedId(skill.id)}
                              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none"
                              style={
                                isSelected
                                  ? { background: 'var(--accent-subtle)', borderColor: 'var(--accent)', color: 'var(--text)' }
                                  : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                              }
                            >
                              {skill.name}
                              {hasEvidence && (
                                <span
                                  className="ml-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: isSelected ? 'var(--accent)' : 'var(--border-strong)' }}
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right — evidence panel */}
              <motion.div variants={item} className="min-w-0 lg:pt-1">
                <div
                  className="rounded-md border p-4 sm:p-5"
                  style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
                  aria-live="polite"
                >
                  {!selectedSkill ? (
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                        Evidence
                      </p>
                      <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
                        Select a skill to see where it has been used.
                      </p>
                      <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                        38 skills across 7 categories. Highlights show projects, experience, and publication links directly tied to each skill.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                        Evidence
                      </p>
                      <h4 className="text-sm font-semibold leading-tight mt-3" style={{ color: 'var(--text)' }}>
                        {selectedSkill.name}
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {SKILL_CATEGORIES.find(c => c.id === selectedSkill.category)?.label}
                      </p>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedSkill.id}
                          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
                          transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                          className="mt-4"
                        >
                          {resolved.length === 0 ? (
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                              No linked portfolio evidence.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {Array.from(groupedEvidence.entries()).map(([typeLabel, items]) => (
                                <div key={typeLabel}>
                                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                                    {typeLabel}
                                  </p>
                                  <ul className="mt-1.5 space-y-1.5">
                                    {items.map((r, idx) => (
                                      <li key={`${r.label}-${idx}`} className="flex items-start justify-between gap-3">
                                        <span className="text-sm leading-snug min-w-0" style={{ color: 'var(--text-secondary)' }}>
                                          {r.label}
                                        </span>
                                        {r.href && (
                                          <a
                                            href={r.href}
                                            className="shrink-0 text-xs underline-offset-4 hover:underline"
                                            style={{ color: 'var(--text-muted)' }}
                                          >
                                            View
                                          </a>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};
