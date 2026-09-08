import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { SkillEvidencePanel } from '../components/skills/SkillEvidencePanel';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';
import { prefersReducedMotion } from '../utils';
import { resolveSkillEvidenceList, evidenceCountLabel } from '../utils/skillEvidence';
import { usePortfolioMode } from '../context/PortfolioModeContext';

/** The evidence panel is mounted once. Above this width it sits in the right rail. */
const RAIL_QUERY = '(min-width: 1024px)';
const PANEL_ID = 'skills-evidence';

export const Skills = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;
  const { isRecruiter } = usePortfolioMode();

  // A18: below the rail breakpoint the panel renders inline, directly under the
  // selected skill's own category. Before this, selecting "Python" at 375px put its
  // evidence ~960px further down the page — off-screen, so the tap looked inert.
  const [hasRail, setHasRail] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(RAIL_QUERY).matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia(RAIL_QUERY);
    const onChange = () => setHasRail(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SKILLS>();
    for (const cat of SKILL_CATEGORIES) {
      const list = SKILLS.filter(s => s.category === cat.id);
      if (list.length) map.set(cat.id, list);
    }
    return map;
  }, []);

  const selectedSkill = useMemo(
    () => (selectedId ? SKILLS.find(s => s.id === selectedId) ?? null : null),
    [selectedId]
  );

  const selectedCategoryLabel = selectedSkill
    ? SKILL_CATEGORIES.find(c => c.id === selectedSkill.category)?.label
    : undefined;

  // Resolved once for the whole canonical list rather than per button per render.
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of SKILLS) m.set(s.id, resolveSkillEvidenceList(s).length);
    return m;
  }, []);

  if (!SKILLS.length) return null;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.03 } },
  };
  const item = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.34, ease: 'easeOut' as const } },
  };

  const panel = (
    <SkillEvidencePanel
      skill={selectedSkill}
      panelId={PANEL_ID}
      reduced={reduced}
      categoryLabel={selectedCategoryLabel}
    />
  );

  const renderSkillButton = (skill: (typeof SKILLS)[number]) => {
    const isSelected = selectedId === skill.id;
    const count = counts.get(skill.id) ?? 0;
    return (
      <button
        key={skill.id}
        type="button"
        aria-expanded={isSelected}
        aria-controls={PANEL_ID}
        aria-label={`${skill.name} — ${evidenceCountLabel(count)}`}
        onClick={() => setSelectedId(prev => (prev === skill.id ? null : skill.id))}
        className="skill-chip inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none min-h-[32px]"
        style={
          isSelected
            ? { background: 'var(--accent-subtle)', borderColor: 'var(--accent)', color: 'var(--text)' }
            : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
        }
      >
        {skill.name}
        {count > 0 && (
          <span
            className="ml-1.5 w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: isSelected ? 'var(--accent)' : 'var(--border-strong)' }}
            aria-hidden="true"
          />
        )}
      </button>
    );
  };

  return (
    <section id="skills" className="py-12 sm:py-16 lg:py-20 relative">
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
          <motion.p
            variants={item}
            className="text-sm leading-relaxed mt-2 max-w-[60ch]"
            style={{ color: 'var(--text-muted)' }}
          >
            {isRecruiter
              ? 'Not self-rated. Each skill is listed with the portfolio evidence behind it.'
              : 'Not self-rated. Select a skill to see the portfolio evidence behind it.'}
          </motion.p>
          <motion.div
            variants={item}
            className="mt-4 h-px max-w-[640px]"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          {isRecruiter ? (
            <motion.div variants={item} className="mt-8 space-y-6">
              {SKILL_CATEGORIES.map(cat => {
                const list = grouped.get(cat.id);
                if (!list) return null;
                const withEvidence = list.filter(s => s.evidence?.length);
                const withoutEvidence = list.filter(s => !s.evidence?.length);
                // Evidence-backed first — ordering by proof, not by an invented score.
                const ordered = [...withEvidence, ...withoutEvidence];
                return (
                  <div key={cat.id} className="min-w-0">
                    <h3
                      className="text-[11px] font-semibold tracking-[0.12em] uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {cat.label}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed break-words"
                      style={{ color: 'var(--text-secondary)', overflowWrap: 'anywhere' as const }}
                    >
                      {ordered.map(s => s.name).join(' · ')}
                    </p>
                    {withEvidence.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {withEvidence.slice(0, 2).map(s => {
                          const ev = resolveSkillEvidenceList(s);
                          // Two named sources plus a count — enough to prove the skill is
                          // grounded without turning the scan view into a full listing.
                          const shown = ev.slice(0, 2).map(e => e.label).join(' · ');
                          const rest = ev.length - 2;
                          return (
                            <li
                              key={s.id}
                              className="text-xs leading-relaxed break-words"
                              style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}
                            >
                              <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                              {' — '}
                              {shown}
                              {rest > 0 ? ` · +${rest} more` : ''}
                            </li>
                          );
                        })}
                      </ul>
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
                  const holdsSelection = !hasRail && selectedSkill?.category === cat.id;
                  return (
                    <motion.div key={cat.id} variants={item} className="min-w-0">
                      <h3
                        className="text-[11px] font-semibold tracking-[0.12em] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {cat.label}
                      </h3>
                      <div className="mt-3 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
                      <div className="mt-3 flex flex-wrap gap-2">{list.map(renderSkillButton)}</div>
                      {/* Only one skill is expanded at a time, so at most one of these mounts. */}
                      {holdsSelection && <div className="mt-4">{panel}</div>}
                    </motion.div>
                  );
                })}
              </div>

              {/* Right — evidence rail (desktop only; the same single panel instance) */}
              {hasRail && (
                <motion.div variants={item} className="min-w-0 lg:pt-1 lg:sticky lg:top-24">
                  {panel}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};
