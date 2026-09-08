import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A17 — shared continuity marker for Education → Publications → Certifications.
 *
 * Three sections, one progression. `step` is 1-based. Purely decorative: the
 * heading below it already carries the meaning, so this is aria-hidden and
 * introduces no tab stop, no live region and no duplicated text.
 */
export function EvidenceSequence({ step }: { step: 1 | 2 | 3 }) {
  const { isRecruiter } = usePortfolioMode();
  if (isRecruiter) return null;

  return (
    <div className="evidence-seq" aria-hidden="true">
      <span className="evidence-seq__rule" />
      <span className="evidence-seq__dots">
        {[1, 2, 3].map(i => (
          <span key={i} className="evidence-seq__dot" data-on={i <= step ? '' : undefined} />
        ))}
      </span>
    </div>
  );
}
