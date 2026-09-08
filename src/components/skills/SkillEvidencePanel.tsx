import { motion } from 'framer-motion';
import type { Skill } from '../../types/portfolio';
import { resolveSkillEvidenceList, evidenceCountLabel } from '../../utils/skillEvidence';

/**
 * A18 — the receipts for one skill.
 *
 * Rows keep canonical evidence order (no invented ranking), carry a quiet source-type
 * label so range is visible without badges shouting, and link to the section that holds
 * the actual proof. A skill with no evidence says so plainly instead of looking broken.
 */
export function SkillEvidencePanel({
  skill,
  panelId,
  reduced,
  categoryLabel,
}: {
  skill: Skill | null;
  panelId: string;
  reduced: boolean;
  categoryLabel?: string;
}) {
  const resolved = skill ? resolveSkillEvidenceList(skill) : [];

  return (
    <div
      id={panelId}
      className="skill-evidence rounded-md border p-4 sm:p-5 min-w-0 overflow-hidden"
      style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
    >
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
        Evidence
      </p>

      {!skill ? (
        <>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
            Select a skill to see where it has been used.
          </p>
          <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Each skill links to the projects, experience, publication or certification it comes from.
          </p>
        </>
      ) : (
        <motion.div
          key={skill.id}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
        >
          <h4 className="text-sm font-semibold leading-tight mt-3 break-words" style={{ color: 'var(--text)' }}>
            {skill.name}
          </h4>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {categoryLabel ? `${categoryLabel} · ` : ''}
            {evidenceCountLabel(resolved.length)}
          </p>

          {resolved.length > 0 && (
            <ul className="skill-evidence__list mt-3.5 space-y-2">
              {resolved.map((r, idx) => (
                <li key={`${r.type}-${r.label}-${idx}`} className="skill-evidence__row min-w-0">
                  <a
                    href={r.href}
                    className="skill-evidence__link group flex items-baseline justify-between gap-3 min-w-0 rounded-sm"
                    aria-label={`${r.label} — ${r.typeLabel}. Go to ${r.typeLabel.toLowerCase()} section.`}
                  >
                    <span
                      className="text-sm leading-snug min-w-0 break-words"
                      style={{ color: 'var(--text-secondary)', overflowWrap: 'anywhere' }}
                    >
                      {r.label}
                    </span>
                    <span
                      className="text-[10px] font-semibold tracking-[0.1em] uppercase shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {r.typeLabel}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}
