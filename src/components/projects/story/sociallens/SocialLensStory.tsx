import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryStage } from '../../../story/StoryStage';
import { StoryNode } from '../../../story/StoryNode';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryWindow } from '../../../story/StoryWindow';
import { StoryStatus } from '../../../story/StoryStatus';
import type { ProjectStoryComponentProps } from '../storyRegistry';

/**
 * SocialLens visual world — an analytics data pipeline, not an AI product.
 *
 * Every depicted concept is backed by canonical project data: YouTube metrics only,
 * scheduled ingestion, OAuth refresh + persistence, idempotent snapshot writes,
 * a normalized PostgreSQL time-series store, and REST analytics APIs. Nothing here
 * asserts a second ingestion source, opinion scoring, ranking, or any forward-looking
 * claim — the trend windows are read back out of stored history, nothing more.
 */

const ARIA_LABEL =
  'A YouTube analytics system where a scheduled job ingests channel and video metrics, refreshes and persists OAuth access, writes idempotent daily snapshots into a PostgreSQL history table, and serves 7, 30 and 90 day trends computed from that accumulated history through REST analytics APIs.';

const DESCRIPTION =
  'SocialLens system diagram: YouTube channel and video metrics are the only source; a scheduled ingest job refreshes them daily while keeping OAuth access refreshed and persisted; each refresh writes one snapshot per channel and day, so a repeated poll is stored once rather than duplicated; snapshots accumulate in PostgreSQL as a normalized history spanning day 1 to day 90; REST analytics endpoints then read that stored history and resolve 7, 30 and 90 day trends.';

const DESKTOP_MAX_STEP = 6;
const COMPACT_MAX_STEP = 4;
const STEP_MS = 800;
const HOLD_MS = 2000;

/** Illustrative snapshot heights — a history strip, not reported figures. */
const BARS = [34, 46, 41, 55, 50, 66, 61, 78, 72, 88];
const TREND_WINDOWS = ['7d', '30d', '90d'] as const;
const TREND_PATHS: Record<(typeof TREND_WINDOWS)[number], string> = {
  '7d': '1 11 L 9 8 L 17 9 L 25 5 L 33 6 L 41 3',
  '30d': '1 10 L 9 9 L 17 6 L 25 7 L 33 4 L 41 4',
  '90d': '1 12 L 9 10 L 17 10 L 25 7 L 33 5 L 41 2',
};

type NodeState = 'active' | 'completed' | 'idle';

export function SocialLensStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isRecruiter, isReducedMotion, isCompact, isDocumentVisible } = useStoryLifecycle(ref, {
    competitive: true,
  });

  const isStatic = isRecruiter || isReducedMotion;
  const compact = compactProp ?? isCompact;
  const maxStep = compact ? COMPACT_MAX_STEP : DESKTOP_MAX_STEP;
  const [step, setStep] = useState(() => (isStatic ? maxStep : 0));

  // Finite explanatory sequence. Timers exist only while the story is the active
  // one, visible, and the document is foregrounded — never offscreen or hidden.
  useEffect(() => {
    if (isStatic) {
      setStep(maxStep);
      return;
    }
    if (!shouldAnimate) return;
    if (step >= maxStep) {
      const t = setTimeout(() => setStep(0), HOLD_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => Math.min(s + 1, maxStep)), STEP_MS);
    return () => clearTimeout(t);
  }, [step, shouldAnimate, isStatic, isDocumentVisible, maxStep]);

  useEffect(() => {
    if (isStatic) setStep(maxStep);
  }, [isStatic, maxStep]);

  // Node → sequence position. Compact folds OAuth into the ingest step and merges
  // the API and trend surfaces, so it stays at four primary objects.
  const at = compact
    ? { source: 0, ingest: 1, oauth: 2, store: 2, grow: 3, api: 4, trends: 4 }
    : { source: 0, ingest: 1, oauth: 2, store: 3, grow: 4, api: 5, trends: 6 };

  const stateFor = (idx: number): NodeState => {
    if (isStatic) return 'completed';
    if (step > idx) return 'completed';
    if (step === idx) return 'active';
    return 'idle';
  };

  const storeState: NodeState = isStatic
    ? 'completed'
    : step > at.grow
      ? 'completed'
      : step >= at.store
        ? 'active'
        : 'idle';

  const linkActive = (afterIdx: number) => (isStatic ? true : step > afterIdx);

  const oauthOk = isStatic || step >= at.oauth;
  const firstStored = isStatic || step >= at.store;
  const historyGrown = isStatic || step >= at.grow;
  const trendsResolved = isStatic || step >= at.trends;

  // Compact samples every other day so the strip still climbs day 1 → day 90;
  // taking the first six would show only the flat early history.
  const bars = compact ? BARS.filter((_, i) => i % 2 === 0) : BARS;
  const filledBars = historyGrown ? bars.length : firstStored ? 1 : 0;

  const storeStatus = (
    <StoryStatus
      variant={historyGrown ? 'success' : 'neutral'}
      label={historyGrown ? 'Idempotent write' : 'Snapshot store'}
      detail={
        historyGrown
          ? compact
            ? 'stored once'
            : 'repeat poll · stored once'
          : firstStored
            ? compact
              ? 'first snapshot'
              : 'first snapshot stored'
            : compact
              ? 'awaiting refresh'
              : 'awaiting scheduled refresh'
      }
    />
  );

  // ── Snapshot store: the visual centre of gravity ──────────────────────────
  const store = (
    <div
      data-story-node="primary"
      data-node-id="store"
      className="pl-2"
      style={{
        // The store is the centre of gravity: a database-toned edge marks it as the
        // one object the rest of the pipeline exists to fill and read back.
        borderLeft: `2px solid ${storeState === 'idle' ? 'var(--border-strong)' : 'var(--story-database)'}`,
        transition: 'border-color 420ms ease-out',
      }}
    >
      <StoryWindow title="postgresql · snapshot history">
        <div className={`flex items-end gap-[3px] min-w-0 ${compact ? 'h-8' : 'h-9'}`} aria-hidden="true">
          {bars.map((h, i) => {
            const filled = i < filledBars;
            return (
              <span
                key={i}
                className="flex-1 rounded-[1px]"
                style={{
                  height: filled ? `${h}%` : '12%',
                  background: filled ? 'var(--story-database)' : 'var(--border-strong)',
                  opacity: filled ? 0.85 : 0.35,
                  transition: 'height 420ms ease-out, opacity 420ms ease-out, background 420ms ease-out',
                }}
              />
            );
          })}
        </div>
        <div
          className="flex items-center justify-between gap-2 mt-1 min-w-0 text-[10px] leading-none"
          style={{ color: 'var(--text-muted)' }}
          aria-hidden="true"
        >
          <span>day 1</span>
          {!compact && <span>day 30</span>}
          <span>day 90</span>
        </div>
        {/* Own row at every width: at 320px a shared row hyphenates "Idempotent". */}
        <div className={`min-w-0 ${compact ? 'mt-2' : 'mt-2.5'}`} aria-hidden="true">
          {storeStatus}
        </div>
      </StoryWindow>
    </div>
  );

  // ── Trend surface: 7/30/90-day windows read back from stored history ──────
  const trendLines = (
    <div
      className={`flex items-center flex-wrap min-w-0 ${compact ? 'mt-1.5 gap-2' : 'mt-2 gap-3'}`}
      aria-hidden="true"
    >
      {TREND_WINDOWS.map(w => (
        <span key={w} className="inline-flex items-center gap-1.5">
          <svg
            width="42"
            height="14"
            viewBox="0 0 42 14"
            style={{
              display: 'block',
              color: 'var(--story-cloud)',
              opacity: trendsResolved ? 0.95 : 0.3,
              transition: 'opacity 420ms ease-out',
            }}
          >
            <path
              d={`M ${TREND_PATHS[w]}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
            {w}
          </span>
        </span>
      ))}
    </div>
  );

  const trendCursor = (
    <motion.span
      className="inline-block w-1 h-1 rounded-full"
      style={{ background: 'var(--story-cloud)' }}
      animate={shouldAnimate && trendsResolved ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.6 }}
      transition={
        shouldAnimate && trendsResolved
          ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }
      }
      aria-hidden="true"
    />
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} withGrid className="overflow-hidden">
      <div ref={ref} className="min-w-0" style={{ minHeight: compact ? 220 : 340 }}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2 min-w-0">
          <span
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          >
            Analytics data pipeline
          </span>
          {!compact && (
            <span className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
              YouTube · daily snapshots
            </span>
          )}
        </div>

        <div data-story-node="primary" data-node-id="source">
          <StoryNode
            variant="neutral"
            label="YouTube metrics"
            detail={compact ? 'channel & video statistics' : 'channel & video statistics · the only source'}
            state={stateFor(at.source)}
          />
        </div>
        <StoryConnector active={linkActive(at.source)} orientation="vertical" dense />

        <div data-story-node="primary" data-node-id="ingest">
          <StoryNode
            variant="automation"
            subtle
            label="Scheduled ingest"
            detail="daily refresh job"
            state={stateFor(at.ingest)}
          >
            <div className="mt-2 min-w-0" aria-hidden="true">
              <StoryStatus
                variant={oauthOk ? 'success' : 'neutral'}
                label="OAuth"
                detail={
                  oauthOk ? (compact ? 'refreshed' : 'refreshed & persisted') : 'access check'
                }
              />
            </div>
          </StoryNode>
        </div>
        <StoryConnector active={linkActive(at.ingest)} orientation="vertical" dense />

        {store}
        <StoryConnector active={linkActive(at.grow)} orientation="vertical" dense />

        {compact ? (
          <div data-story-node="primary" data-node-id="api-trends">
            <StoryNode
              variant="backend"
              label="Analytics API → trends"
              detail="REST over stored history"
              state={stateFor(at.api)}
            >
              {trendLines}
            </StoryNode>
          </div>
        ) : (
          <>
            <div data-story-node="primary" data-node-id="api">
              <StoryNode
                variant="backend"
                label="Analytics API"
                detail="REST endpoints read stored snapshots"
                state={stateFor(at.api)}
              />
            </div>
            <StoryConnector active={linkActive(at.api)} orientation="vertical" dense />
            <div data-story-node="primary" data-node-id="trends">
              <StoryNode
                variant="cloud"
                subtle
                label="7 / 30 / 90-day trends"
                detail="computed from accumulated history"
                state={stateFor(at.trends)}
              >
                {trendLines}
              </StoryNode>
            </div>
          </>
        )}

        <div className="mt-2 flex items-center justify-center gap-1.5 min-w-0">
          {trendCursor}
          <p className="text-[10px] leading-snug text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
            {isStatic
              ? 'Static system'
              : shouldAnimate
                ? historyGrown
                  ? 'History growing · analytics served from stored snapshots'
                  : 'Scheduled ingest → idempotent snapshot → analytics API'
                : 'Paused offscreen'}
          </p>
        </div>
      </div>
    </StoryStage>
  );
}
