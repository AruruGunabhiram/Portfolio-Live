import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryStage } from '../../../story/StoryStage';
import { StoryWindow } from '../../../story/StoryWindow';
import type { ProjectStoryComponentProps } from '../storyRegistry';

/**
 * Clinical Reconciliation visual world — record comparison and human review.
 *
 * The matrix, rather than a model or medical interface, is the centre of gravity.
 * All record content is explicitly synthetic and the final state stops at an
 * accepted reconciliation result; it does not depict downstream action.
 */

const ARIA_LABEL =
  'Multiple synthetic medication-source records are normalized and compared, a conflicting value and a missing field are surfaced with data-quality, confidence, and severity assessment, and a human must approve or reject the reconciled result before it is accepted.';

const DESCRIPTION =
  'Clinical Reconciliation comparison diagram using synthetic records: Source A, Source B, and Source C are normalized into comparable fields; the discrepancy workspace highlights a dose value conflict and a missing frequency field; completeness, accuracy, timeliness, plausibility, confidence, and severity are assessed; explicit human approve or reject review is required before the reconciled result is accepted. The diagram represents record reconciliation only, with no downstream action depicted.';

const FINAL_STEP = 6;
const HOLD_MS = 1800;
const STEP_DELAYS = [650, 650, 850, 650, 1000, 650] as const;

type NodeState = 'active' | 'completed' | 'idle';

const qualityRows = [
  ['Completeness', 'review'],
  ['Accuracy', 'review'],
  ['Timeliness', 'current'],
  ['Plausibility', 'check'],
] as const;

export function ClinicalReconciliationStory({
  compact: compactProp,
}: ProjectStoryComponentProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isRecruiter, isReducedMotion, isCompact, isDocumentVisible } =
    useStoryLifecycle(ref, { competitive: true });

  const isStatic = isRecruiter || isReducedMotion;
  const compact = compactProp ?? isCompact;
  const [step, setStep] = useState(() => (isStatic ? FINAL_STEP : 0));

  useEffect(() => {
    if (isStatic) {
      setStep(FINAL_STEP);
      return;
    }
    if (!shouldAnimate) return;
    const delay = step >= FINAL_STEP ? HOLD_MS : STEP_DELAYS[step];
    const timer = setTimeout(
      () => setStep(current => (current >= FINAL_STEP ? 0 : current + 1)),
      delay
    );
    return () => clearTimeout(timer);
  }, [step, shouldAnimate, isStatic, isDocumentVisible]);

  useEffect(() => {
    if (isStatic) setStep(FINAL_STEP);
  }, [isStatic]);

  const stateFor = (at: number): NodeState => {
    if (isStatic || step > at) return 'completed';
    if (step === at) return 'active';
    return 'idle';
  };
  const linkActive = (after: number) => isStatic || step > after;

  const sourcesReady = isStatic || step >= 1;
  const normalized = isStatic || step >= 2;
  const discrepanciesVisible = isStatic || step >= 3;
  const assessed = isStatic || step >= 4;
  const awaitingReview = !isStatic && step === 4;
  const approved = isStatic || step >= 5;
  const accepted = isStatic || step >= 6;

  const sourceGroup = (
    <div data-story-node="primary" data-node-id="sources" className="min-w-0">
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-1' : 'mb-1.5'}`}>
        <p className={`${compact ? 'text-[9px] tracking-[0.04em]' : 'text-[10px] tracking-[0.08em]'} font-semibold uppercase`} style={{ color: 'var(--text-muted)' }}>
          Medication-source records
        </p>
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>synthetic example</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {['A', 'B', 'C'].map((source, index) => (
          <motion.div
            key={source}
            className="rounded border px-2 py-1.5 min-w-0"
            style={{
              background: sourcesReady ? 'var(--story-backend-subtle)' : 'var(--surface)',
              borderColor: index === 1 ? 'var(--story-database)' : 'var(--story-backend)',
              opacity: sourcesReady ? 1 : 0.68,
            }}
            animate={shouldAnimate && step === 0 ? { y: [2, 0], opacity: [0.58, 1] } : undefined}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
          >
            <p className="text-[10px] font-semibold leading-none" style={{ color: 'var(--text)' }}>
              Source {source}
            </p>
            <p className="text-[9px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
              Record {index + 1}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const normalization = (
    <div data-story-node="primary" data-node-id="normalized" className="min-w-0">
      <div
        className="rounded-md border px-2.5 py-2 h-full"
        style={{
          background: normalized ? 'var(--story-database-subtle)' : 'var(--surface)',
          borderColor: normalized ? 'var(--story-database-border)' : 'var(--border)',
          boxShadow: 'inset 2px 0 0 var(--story-database)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>
            Normalized record
          </p>
          <span className="text-[9px] font-semibold" style={{ color: normalized ? 'var(--story-success)' : 'var(--text-muted)' }}>
            {normalized ? 'COMPARABLE' : 'PREPARING'}
          </span>
        </div>
        <p className="text-[10px] leading-snug mt-1.5" style={{ color: 'var(--text-muted)' }}>
          name · dose · frequency standardized
        </p>
      </div>
    </div>
  );

  const comparisonRows = compact
    ? [
        ['Name', 'all sources match', 'match'],
        ['Dose', 'values disagree', 'value conflict'],
        ['Frequency', 'Source C has no value', 'missing field'],
      ] as const
    : [
        ['Name', 'Medication A', 'Medication A', 'Medication A', 'match'],
        ['Dose', '10 mg', '20 mg', '10 mg', 'value conflict'],
        ['Frequency', 'daily', 'daily', 'missing', 'missing field'],
      ] as const;

  const comparisonContent = (
    <>
      {compact && (
        <>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>Medication comparison</p>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--story-warning)' }}>discrepancy workspace</span>
          </div>
          <div
            className="flex items-center justify-between gap-2 rounded border px-2 py-1 mb-1.5"
            style={{ background: 'var(--story-database-subtle)', borderColor: 'var(--story-database-border)' }}
          >
            <span className="text-[9px] font-semibold tracking-[0.06em]" style={{ color: 'var(--text-muted)' }}>NORMALIZED</span>
            <span className="text-[9px]" style={{ color: normalized ? 'var(--story-success)' : 'var(--text-muted)' }}>
              comparable fields
            </span>
          </div>
        </>
      )}
      <div className="grid grid-cols-[.8fr_1.45fr_1fr] gap-x-1 text-[9px] sm:text-[10px] leading-snug">
        <span className="font-semibold pb-1" style={{ color: 'var(--text-muted)' }}>Field</span>
        <span className="font-semibold pb-1" style={{ color: 'var(--text-muted)' }}>{compact ? 'Comparison' : 'Source A · B · C'}</span>
        <span className="font-semibold pb-1 text-right" style={{ color: 'var(--text-muted)' }}>Discrepancy</span>
        {comparisonRows.map(row => {
          const mismatch = row[row.length - 1] !== 'match';
          return (
            <div key={row[0]} className="contents">
              <span className={`border-t ${compact ? 'py-1' : 'py-1.5'} font-medium`} style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>{row[0]}</span>
              <span className={`border-t ${compact ? 'py-1' : 'py-1.5'} min-w-0`} style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {compact ? row[1] : `${row[1]} · ${row[2]} · ${row[3]}`}
              </span>
              <span
                className={`border-t ${compact ? 'py-1' : 'py-1.5'} text-right font-semibold`}
                style={{ borderColor: 'var(--border)', color: mismatch && discrepanciesVisible ? 'var(--story-warning)' : 'var(--text-muted)' }}
              >
                {discrepanciesVisible ? row[row.length - 1] : 'comparing'}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );

  const comparison = (
    <div
      data-story-node="primary"
      data-node-id="comparison"
      className="min-w-0 rounded-md p-0.5"
      style={{
        background: discrepanciesVisible ? 'var(--story-warning)' : 'var(--border-strong)',
        boxShadow: discrepanciesVisible ? 'var(--shadow-sm)' : 'none',
        transition: 'background 360ms ease-out, box-shadow 360ms ease-out',
      }}
    >
      {compact ? (
        <div className="rounded-[5px] border px-2 py-1.5 min-w-0" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
          {comparisonContent}
        </div>
      ) : (
        <StoryWindow title="medication comparison · discrepancy workspace">
          {comparisonContent}
        </StoryWindow>
      )}
    </div>
  );

  const assessment = (
    <div data-story-node={compact ? undefined : 'primary'} data-node-id="assessment" className="min-w-0">
      <div
        className="rounded-md border px-2.5 py-2 h-full"
        style={{
          background: assessed ? 'var(--story-database-subtle)' : 'var(--surface)',
          borderColor: assessed ? 'var(--story-database-border)' : 'var(--border)',
          boxShadow: 'inset 2px 0 0 var(--story-database)',
        }}
      >
        <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Data quality</p>
        <div className="grid grid-cols-1 gap-y-0.5 mt-1.5">
          {qualityRows.map(([label, value]) => (
            <p key={label} className="text-[9px] leading-snug flex justify-between gap-1 min-w-0" style={{ color: 'var(--text-muted)' }}>
              <span>{label}</span>
              <span className="font-semibold" style={{ color: assessed ? 'var(--story-database)' : 'var(--text-muted)' }}>{assessed ? value : '—'}</span>
            </p>
          ))}
        </div>
        <div className="mt-2 pt-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-2 text-[9px] leading-none">
            <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
            <span className="font-semibold" style={{ color: assessed ? 'var(--story-database)' : 'var(--text-muted)' }}>{assessed ? 'assessed' : 'pending'}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[8px]" style={{ color: 'var(--text-muted)' }}>
            <span>low</span>
            <div className="relative h-1 rounded-full flex-1" style={{ background: 'var(--border)' }}>
              <motion.span
                className="absolute top-[-2px] w-2 h-2 rounded-full"
                style={{ background: 'var(--story-database)', left: assessed ? '62%' : '0%' }}
                animate={shouldAnimate ? { left: assessed ? '62%' : '0%' } : undefined}
                transition={{ duration: shouldAnimate ? 0.5 : 0, ease: 'easeOut' }}
              />
            </div>
            <span>high</span>
          </div>
          <p className="text-[9px] leading-snug mt-2" style={{ color: 'var(--text-muted)' }}>
            Severity · <span className="font-semibold" style={{ color: assessed ? 'var(--story-warning)' : 'var(--text-muted)' }}>{assessed ? 'review required' : 'pending'}</span>
          </p>
        </div>
      </div>
    </div>
  );

  const review = (
    <div data-story-node={compact ? undefined : 'primary'} data-node-id="review" className="min-w-0">
      <motion.div
        className="rounded-md border px-2.5 py-2 h-full"
        style={{
          background: approved ? 'var(--story-success-subtle)' : awaitingReview ? 'var(--story-warning-subtle)' : 'var(--surface)',
          borderColor: approved ? 'var(--story-success-border)' : awaitingReview ? 'var(--story-warning-border)' : 'var(--border)',
          boxShadow: `inset 2px 0 0 ${approved ? 'var(--story-success)' : 'var(--story-neutral)'}`,
        }}
        animate={shouldAnimate && awaitingReview ? { opacity: [1, 0.65, 1] } : undefined}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Human review</p>
          <span className="text-[9px] font-semibold" style={{ color: approved ? 'var(--story-success)' : 'var(--story-warning)' }}>
            {approved ? 'APPROVED' : awaitingReview ? 'PENDING' : 'REQUIRED'}
          </span>
        </div>
        <p className="text-[10px] leading-snug mt-1.5" style={{ color: 'var(--text-muted)' }}>approve / reject required</p>
      </motion.div>
    </div>
  );

  const result = (
    <div data-story-node="primary" data-node-id="result" className="min-w-0">
      <div
        className={`rounded-md border px-2.5 ${compact ? 'py-1.5' : 'py-2'} h-full`}
        style={{
          background: accepted ? 'var(--story-success-subtle)' : 'var(--surface)',
          borderColor: accepted ? 'var(--story-success-border)' : 'var(--border)',
          boxShadow: `inset 2px 0 0 ${accepted ? 'var(--story-success)' : 'var(--story-neutral)'}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Reconciled result</p>
          <span className="text-[9px] font-semibold" style={{ color: accepted ? 'var(--story-success)' : 'var(--text-muted)' }}>
            {accepted ? 'ACCEPTED' : 'HELD'}
          </span>
        </div>
        <p className="text-[10px] leading-snug mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {accepted ? 'human-reviewed result · accepted after review' : 'no result accepted before review'}
        </p>
      </div>
    </div>
  );

  const compactQualityReview = (
    <div
      data-story-node="primary"
      data-node-id="quality-review"
      className="rounded-md border px-2.5 py-2 min-w-0"
      style={{
        background: approved ? 'var(--story-success-subtle)' : assessed ? 'var(--story-database-subtle)' : 'var(--surface)',
        borderColor: approved ? 'var(--story-success-border)' : assessed ? 'var(--story-database-border)' : 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--text)' }}>Data quality + confidence</p>
        <span className="text-[9px] font-semibold" style={{ color: assessed ? 'var(--story-database)' : 'var(--text-muted)' }}>
          {assessed ? 'ASSESSED' : 'PENDING'}
        </span>
      </div>
      <p className="text-[9px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
        Completeness · Accuracy · Timeliness · Plausibility
      </p>
      <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--text)' }}>Human review</p>
          <p className="text-[9px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>approve / reject required</p>
        </div>
        <span className="text-[9px] font-semibold shrink-0" style={{ color: approved ? 'var(--story-success)' : 'var(--story-warning)' }}>
          {approved ? 'APPROVED' : awaitingReview ? 'PENDING' : 'REQUIRED'}
        </span>
      </div>
      <p className="text-[9px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
        Confidence assessed · Severity <span style={{ color: 'var(--story-warning)' }}>review required</span>
      </p>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} withGrid className="overflow-hidden">
      <div ref={ref} className="min-w-0" style={{ minHeight: compact ? 350 : 510 }} aria-hidden="true">
        {!compact && (
          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Record reconciliation
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {isStatic ? 'Static system' : !shouldAnimate ? 'Paused offscreen' : accepted ? 'Review complete' : 'Comparison in progress'}
            </span>
          </div>
        )}

        {compact ? (
          <>
            {sourceGroup}
            <StoryConnector active={linkActive(0)} orientation="vertical" dense />
            {comparison}
            <StoryConnector active={linkActive(2)} orientation="vertical" dense />
            {compactQualityReview}
            <StoryConnector active={linkActive(5)} orientation="vertical" dense />
            {result}
          </>
        ) : (
          <>
            <div className="grid grid-cols-[1.25fr_.75fr] gap-2 min-w-0 items-stretch">
              {sourceGroup}
              {normalization}
            </div>
            <StoryConnector active={linkActive(1)} orientation="vertical" dense />
            <div className="grid grid-cols-[1.45fr_.75fr] gap-2 min-w-0 items-stretch">
              {comparison}
              {assessment}
            </div>
            <StoryConnector active={linkActive(3)} orientation="vertical" dense />
            <div className="grid grid-cols-[.8fr_auto_.95fr] gap-2 min-w-0 items-stretch">
              {review}
              <StoryConnector active={linkActive(5)} orientation="horizontal" dense />
              {result}
            </div>
          </>
        )}

        <span className="sr-only">Current visual state: {stateFor(Math.min(step, FINAL_STEP))}.</span>
      </div>
    </StoryStage>
  );
}
