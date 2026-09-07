import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryStage } from '../../../story/StoryStage';
import { StoryNode } from '../../../story/StoryNode';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryWindow } from '../../../story/StoryWindow';
import { StoryStatus } from '../../../story/StoryStatus';
import type { ProjectStoryComponentProps } from '../storyRegistry';

const ARIA_LABEL =
  'An execution system where a task enters a durable orchestrator, passes deterministic policy and state checks, uses AI only for semantic reasoning, pauses for human approval, executes through a controlled worker, and records an auditable result.';

const DESCRIPTION =
  'Ember system diagram: a task is persisted by a durable orchestrator; deterministic policy and state gates decide what is permitted; semantic reasoning is engaged only where judgment is required; the task waits for human approval; an available worker then performs the approved action; the resulting state transition is recorded as an auditable result.';

/** Durable-state labels — a recognizable few, not the internal enum. */
type RunState = 'QUEUED' | 'RUNNING' | 'WAITING FOR USER' | 'COMPLETED';

const DESKTOP_MAX_STEP = 6;
const COMPACT_MAX_STEP = 4;
const STEP_MS = 720;
const HOLD_MS = 2000;

export function EmberStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isRecruiter, isReducedMotion, isCompact, isDocumentVisible } = useStoryLifecycle(ref, {
    competitive: true,
  });

  const isStatic = isRecruiter || isReducedMotion;
  const compact = compactProp ?? isCompact;
  const maxStep = compact ? COMPACT_MAX_STEP : DESKTOP_MAX_STEP;
  const [step, setStep] = useState(() => (isStatic ? maxStep : 0));

  // Sequence advances only while animating; timers never survive pause/unmount.
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

  const stateFor = (idx: number): 'active' | 'completed' | 'idle' => {
    if (isStatic) return 'completed';
    if (!shouldAnimate && step === 0) return idx === 0 ? 'active' : 'idle';
    if (step > idx) return 'completed';
    if (step === idx) return 'active';
    return 'idle';
  };

  const linkActive = (afterIdx: number) => (isStatic ? true : step > afterIdx);

  // Durable run state — the concept is that work waits and resumes, not that it races on.
  const runState: RunState = (() => {
    if (isStatic || step >= maxStep) return 'COMPLETED';
    if (step === 0) return 'QUEUED';
    const approvalStep = compact ? 3 : 4;
    if (step === approvalStep) return 'WAITING FOR USER';
    return 'RUNNING';
  })();

  const auditDone = isStatic || step >= maxStep;
  const approvalIdx = compact ? 3 : 4;
  const awaitingApproval = !isStatic && step === approvalIdx;

  const stateTone =
    runState === 'COMPLETED'
      ? { fg: 'var(--story-success)', bg: 'var(--story-success-subtle)', bd: 'var(--story-success-border)' }
      : runState === 'WAITING FOR USER'
        ? { fg: 'var(--story-warning)', bg: 'var(--story-warning-subtle)', bd: 'var(--story-warning-border)' }
        : { fg: 'var(--text-muted)', bg: 'var(--surface)', bd: 'var(--border)' };

  // ── Orchestrator: the visual centre of gravity ────────────────────────────
  const orchestrator = (
    <div data-story-node="primary" data-node-id="orchestrator">
      <StoryWindow title="ember · durable orchestrator">
        <div className="flex items-start justify-between gap-2 min-w-0 flex-wrap">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>
              Task accepted &amp; persisted
            </p>
            {!compact && (
              <p className="text-[10px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>
                resumable · one orchestrator owns the run
              </p>
            )}
          </div>
          <motion.span
            className="text-[10px] font-semibold tracking-[0.08em] px-1.5 py-1 rounded border shrink-0"
            style={{ color: stateTone.fg, background: stateTone.bg, borderColor: stateTone.bd }}
            animate={shouldAnimate && runState === 'WAITING FOR USER' ? { opacity: [1, 0.62, 1] } : undefined}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            {runState}
          </motion.span>
        </div>
      </StoryWindow>
    </div>
  );

  // ── Task object ───────────────────────────────────────────────────────────
  const task = (
    <div data-story-node="primary" data-node-id="task" className="w-full">
      <StoryNode
        variant="neutral"
        label="Intent / task"
        detail={compact ? 'queued work item' : 'e.g. prepare an application'}
        state={stateFor(0)}
      />
    </div>
  );

  // ── Downstream steps, driven by the orchestrator (left rail) ──────────────
  const rail = (
    <span
      aria-hidden="true"
      className="absolute left-0 top-1 bottom-1 w-px"
      style={{ background: 'var(--story-backend)', opacity: isStatic || step > 1 ? 0.45 : 0.2 }}
    />
  );

  const auditFooter = (
    <div className="mt-3 flex items-center justify-between gap-2 flex-wrap min-w-0" aria-hidden="true">
      <motion.span
        animate={auditDone && shouldAnimate ? { scale: [1, 1.03, 1] } : undefined}
        transition={{ duration: 1.2, repeat: 1 }}
      >
        <StoryStatus
          variant={auditDone ? 'success' : 'neutral'}
          label="Auditable state"
          detail={auditDone ? 'transition recorded' : 'pending'}
        />
      </motion.span>
      <span className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
        Inference gate ✓
      </span>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} withGrid className="overflow-hidden">
      <div ref={ref} className="min-w-0" style={{ minHeight: compact ? 250 : 340 }}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2 min-w-0">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
            Execution control plane
          </span>
          {!compact && (
            <span className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
              bounded autonomy
            </span>
          )}
        </div>

        {task}
        <StoryConnector active={linkActive(0)} orientation="vertical" dense />
        {orchestrator}
        <StoryConnector active={linkActive(1)} orientation="vertical" dense />

        <div className="relative pl-3 min-w-0">
          {rail}
          {compact ? (
            <>
              {/* Compact keeps 4 primary objects: task, orchestrator, gate+reasoning, approval→execution */}
              <div data-story-node="primary" data-node-id="gate-reasoning">
                <StoryNode
                  variant="automation"
                  subtle
                  label="Policy gate · scoped AI"
                  detail="deterministic checks first"
                  state={stateFor(2)}
                />
              </div>
              <StoryConnector active={linkActive(2)} orientation="vertical" dense />
              <div data-story-node="primary" data-node-id="approval-execution">
                <StoryNode
                  variant="backend"
                  label="Approval → execution"
                  detail="human approval, then worker"
                  state={stateFor(3)}
                />
              </div>
            </>
          ) : (
            <>
              <div data-story-node="primary" data-node-id="gate">
                <StoryNode
                  variant="automation"
                  subtle
                  label="Deterministic gate"
                  detail="policy, permission & state transition"
                  state={stateFor(2)}
                />
              </div>
              <StoryConnector active={linkActive(2)} orientation="vertical" dense />
              <div data-story-node="primary" data-node-id="reasoning">
                <StoryNode
                  variant="ai"
                  subtle
                  label="Semantic reasoning"
                  detail="engaged only where judgment is required"
                  state={stateFor(3)}
                />
              </div>
              <StoryConnector active={linkActive(3)} orientation="vertical" dense />
              <div data-story-node="primary" data-node-id="approval">
                <StoryNode
                  variant="neutral"
                  label="Human approval / handoff"
                  detail="run pauses until a person approves"
                  state={stateFor(4)}
                />
              </div>
              <StoryConnector active={linkActive(4)} orientation="vertical" dense />
              <div data-story-node="primary" data-node-id="worker">
                <StoryNode
                  variant="backend"
                  label="Controlled worker"
                  detail="approved action on an available worker"
                  state={stateFor(5)}
                />
              </div>
            </>
          )}
        </div>

        {auditFooter}

        <p className="text-[10px] leading-snug mt-2 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          {isStatic
            ? 'Static system'
            : awaitingApproval
              ? 'Paused · approval required before execution'
              : shouldAnimate
                ? compact
                  ? 'Durable run · gate → approval → execution'
                  : 'Durable run · gate → scoped reasoning → approval → execution → audit'
                : 'Paused offscreen'}
        </p>
      </div>
    </StoryStage>
  );
}
