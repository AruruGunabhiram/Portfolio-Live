import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryNode } from '../../../story/StoryNode';
import { StoryStage } from '../../../story/StoryStage';
import { StoryWindow } from '../../../story/StoryWindow';
import type { ProjectStoryComponentProps } from '../storyRegistry';

/**
 * IncidentPilot visual world — an evidence investigation workspace.
 *
 * The central object verifies citations against repository context. Semantic
 * reasoning is deliberately secondary; deterministic validation, safety gates,
 * explicit approval, and the dry-run boundary own the action path.
 */

const ARIA_LABEL =
  'Incident evidence from CI logs, stack traces, and repository context is redacted and grounded against cited files and lines, passed through deterministic safety checks and explicit human approval, then prepared as a GitHub dry-run rather than an automatic repository change.';

const DESCRIPTION =
  'IncidentPilot investigation diagram: failure evidence is sanitized and bundled with repository context; a grounding workspace verifies the cited file, cited line, and repository evidence before scoped semantic reasoning; deterministic path and output checks then hold the proposed action for human approval; the approved result stops at a GitHub dry-run with no repository mutation.';

const FINAL_STEP = 7;
const HOLD_MS = 1800;
const STEP_DELAYS = [650, 650, 850, 650, 650, 950, 650] as const;

type NodeState = 'active' | 'completed' | 'idle';

export function IncidentPilotStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
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

  const bundled = isStatic || step >= 1;
  const groundingActive = !isStatic && step >= 2 && step <= 3;
  const grounded = isStatic || step >= 3;
  const safetyPassed = isStatic || step >= 5;
  const awaitingApproval = !isStatic && step === 5;
  const approved = isStatic || step >= 6;
  const dryRunReady = isStatic || step >= 7;

  const evidenceSource = (
    <div data-story-node="primary" data-node-id="evidence" className="min-w-0">
      <div
        className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0 h-full"
        style={{
          background: stateFor(0) === 'completed' ? 'var(--accent-subtle)' : 'var(--surface)',
          borderColor: 'var(--border)',
          borderLeftColor: stateFor(0) === 'idle' ? 'var(--story-neutral)' : 'var(--story-database)',
        }}
      >
        <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>Failure evidence</p>
        {compact ? (
          <div className="mt-1 min-w-0 text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
            <p className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold" style={{ color: 'var(--text)' }}>CI log</span>
              <span>failure output</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>Stack trace</span>
            </p>
            <p className="mt-1">cited frame + repository context</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <div
              className="rounded border px-1.5 py-1 min-w-0"
              style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>CI log</p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>failure output</p>
            </div>
            <div
              className="rounded border px-1.5 py-1 min-w-0"
              style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>Stack trace</p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>cited location</p>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );

  const redactionLine = (
    <div className={`flex items-center justify-between gap-2 min-w-0 text-[10px] leading-snug ${compact ? '' : 'mt-1.5'}`}>
      <span style={{ color: 'var(--text-muted)' }}>sensitive value</span>
      <span
        className="font-semibold tracking-[0.06em] rounded px-1.5 py-0.5 border shrink-0"
        style={{
          color: bundled ? 'var(--story-success)' : 'var(--text-muted)',
          background: bundled ? 'var(--story-success-subtle)' : 'var(--surface)',
          borderColor: bundled ? 'var(--story-success-border)' : 'var(--border)',
        }}
      >
        {bundled ? '[REDACTED]' : 'sanitizing'}
      </span>
    </div>
  );

  const groundingRows = (
    <div className={`grid grid-cols-3 gap-1.5 ${compact ? 'mt-2' : 'mt-2.5'}`}>
      {[
        ['cited file', grounded ? 'exists ✓' : 'checking'],
        ['cited line', grounded ? 'verified ✓' : 'checking'],
        ['repository evidence', grounded ? 'grounded ✓' : 'matching'],
      ].map(([label, value]) => (
        <div
          key={label}
          className="block text-center px-1 rounded border py-1.5 min-w-0"
          style={{
            background: grounded ? 'var(--accent-subtle)' : 'var(--surface)',
            borderColor: grounded ? 'var(--story-database)' : 'var(--border)',
            transition: 'background 360ms ease-out, border-color 360ms ease-out',
          }}
        >
          <span className="block text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
            {label}
          </span>
          <span
            className="block mt-0.5 text-center text-[10px] font-semibold leading-snug"
            style={{ color: grounded ? 'var(--story-success)' : 'var(--text-muted)' }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );

  const groundingWorkspace = (
    <div
      data-story-node="primary"
      data-node-id={compact ? 'grounded-investigation' : 'grounding'}
      className="min-w-0 rounded-md p-0.5"
      style={{
        background: groundingActive ? 'var(--story-database)' : 'var(--border-strong)',
        boxShadow: grounded ? 'var(--shadow-sm)' : 'none',
        transition: 'background 360ms ease-out, box-shadow 360ms ease-out',
      }}
    >
      {compact ? (
        <div className="rounded-[5px] border px-2.5 py-2.5 min-w-0" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>
            Grounding · citation verification
          </p>
          <div className="mt-1.5">{redactionLine}</div>
          {groundingRows}
          <p className="text-[10px] leading-snug mt-1.5" style={{ color: step >= 3 || isStatic ? 'var(--story-ai)' : 'var(--text-muted)' }}>
            Scoped reasoning · grounded evidence only
          </p>
        </div>
      ) : (
        <StoryWindow title="grounding workspace · citation verification">
          {groundingRows}
          <div className="flex items-center justify-between gap-2 mt-2 min-w-0">
            <span className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
              Scoped reasoning
            </span>
            <span
              className="text-[10px] font-medium leading-snug text-right"
              style={{ color: step >= 3 || isStatic ? 'var(--story-ai)' : 'var(--text-muted)' }}
            >
              grounded evidence only
            </span>
          </div>
        </StoryWindow>
      )}
    </div>
  );

  const safetyChecks = (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-snug">
      {(compact ? ['grounded', 'path allowed', 'output valid'] : ['evidence grounded', 'path allowed', 'output valid']).map(label => (
        <span key={label} className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: safetyPassed ? 'var(--story-success)' : 'var(--story-warning)' }}>
            {safetyPassed ? '✓' : '○'}
          </span>
          {label}
        </span>
      ))}
    </div>
  );

  const compactApprovalStatus = (
    <motion.div
      className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 rounded border px-2 py-1 min-w-0"
      style={{
        background: approved ? 'var(--story-success-subtle)' : awaitingApproval ? 'var(--story-warning-subtle)' : 'var(--surface)',
        borderColor: approved ? 'var(--story-success-border)' : awaitingApproval ? 'var(--story-warning-border)' : 'var(--border)',
      }}
      animate={shouldAnimate && awaitingApproval ? { opacity: [1, 0.62, 1] } : undefined}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <span className="text-[9px] font-semibold tracking-[0.06em] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>HUMAN APPROVAL</span>
      <span className="text-[10px] font-semibold whitespace-nowrap ml-auto" style={{ color: approved ? 'var(--story-success)' : 'var(--story-warning)' }}>
        {approved ? 'APPROVED' : awaitingApproval ? 'WAITING' : 'REQUIRED'}
      </span>
    </motion.div>
  );

  const bundleNode = (
    <div data-story-node="primary" data-node-id="bundle" className="min-w-0">
      <div
        className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0 h-full"
        style={{
          background: 'var(--story-backend-subtle)',
          borderColor: 'var(--story-backend-border)',
          borderLeftColor: 'var(--story-backend)',
        }}
      >
        <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>Evidence bundle</p>
        <p className="text-[10px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>repository snapshot context</p>
        <div className="mt-1.5 min-w-0">
          <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>sensitive values</p>
          <span
            className="inline-block text-[9px] font-semibold tracking-[0.05em] rounded border px-1.5 py-0.5 mt-0.5"
            style={{
              color: bundled ? 'var(--story-success)' : 'var(--text-muted)',
              background: bundled ? 'var(--story-success-subtle)' : 'var(--surface)',
              borderColor: bundled ? 'var(--story-success-border)' : 'var(--border)',
            }}
          >
            {bundled ? '[REDACTED]' : 'SANITIZING'}
          </span>
        </div>
      </div>
    </div>
  );

  const safetyNode = (
    <div data-story-node="primary" data-node-id="safety" className="min-w-0">
      <div
        className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0 h-full"
        style={{
          background: 'var(--story-automation-subtle)',
          borderColor: 'var(--story-automation-border)',
          borderLeftColor: 'var(--story-automation)',
        }}
      >
        <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>Deterministic safety gate</p>
        <p className="text-[10px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>blocked until checks pass</p>
        <div className="mt-1.5">{safetyChecks}</div>
      </div>
    </div>
  );

  const approvalNode = (
    <div data-story-node="primary" data-node-id="approval" className="min-w-0">
      <div
        className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0 h-full"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: 'var(--story-warning)' }}
      >
        <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>Approval required</p>
        <p className="text-[10px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>execution pauses here</p>
        <div className="mt-1.5">{compactApprovalStatus}</div>
      </div>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} withGrid className="overflow-hidden">
      <div ref={ref} className="min-w-0" style={{ minHeight: compact ? 352 : 530 }} aria-hidden="true">
        <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Evidence investigation
          </span>
          {!compact && (
            <span className="text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
              {isStatic
                ? 'Static system'
                : !shouldAnimate
                  ? 'Paused offscreen'
                  : awaitingApproval
                    ? 'Waiting for approval'
                    : dryRunReady
                      ? 'Dry-run ready'
                      : 'deterministic by default'}
            </span>
          )}
        </div>

        {compact ? (
          <>
            {evidenceSource}
            <StoryConnector active={linkActive(0)} orientation="vertical" dense />
            {groundingWorkspace}
            <StoryConnector active={linkActive(3)} orientation="vertical" dense />
            <div
              data-story-node="primary"
              data-node-id="safety-approval"
              className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0"
              style={{
                background: 'var(--story-automation-subtle)',
                borderColor: 'var(--story-automation-border)',
                borderLeftColor: 'var(--story-automation)',
              }}
            >
              <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>
                Deterministic safety + approval
              </p>
              <div className="mt-1.5">
                {safetyChecks}
              </div>
              <div className="min-w-0 mt-1.5">
                {compactApprovalStatus}
              </div>
              <span className="sr-only">
                {stateFor(4) === 'completed' ? 'Safety checks completed' : 'Safety checks pending'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-[1.05fr_.95fr] gap-2 min-w-0">
              {evidenceSource}
              {bundleNode}
            </div>
            <StoryConnector active={linkActive(1)} orientation="vertical" dense />
            {groundingWorkspace}
            <StoryConnector active={linkActive(3)} orientation="vertical" dense />
            <div className="grid grid-cols-[1.15fr_.85fr] gap-2 min-w-0">
              {safetyNode}
              {approvalNode}
            </div>
          </>
        )}

        <StoryConnector active={linkActive(6)} orientation="vertical" dense />
        <div data-story-node="primary" data-node-id="dry-run">
          {compact ? (
            <div
              className="rounded-md border border-l-[3px] px-2.5 py-2 min-w-0"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeftColor: 'var(--story-cloud)' }}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <p className="text-[11px] font-semibold leading-snug" style={{ color: 'var(--text)' }}>GitHub dry-run</p>
                <span className="text-[9px] font-semibold tracking-[0.05em] shrink-0" style={{ color: dryRunReady ? 'var(--story-success)' : 'var(--text-muted)' }}>
                  {dryRunReady ? 'READY' : 'HELD'}
                </span>
              </div>
              <p className="text-[10px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
                proposed action · no repository mutation
              </p>
            </div>
          ) : (
            <StoryNode
              variant="cloud"
              label="GitHub dry-run"
              detail="proposed action · no repository mutation"
              state={stateFor(7)}
            >
              <div className="mt-1.5 flex items-center justify-between gap-2 min-w-0">
              <span className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                auditable result
              </span>
              <motion.span
                className="text-[10px] font-semibold tracking-[0.06em]"
                style={{ color: dryRunReady ? 'var(--story-success)' : 'var(--text-muted)' }}
                animate={shouldAnimate && dryRunReady ? { opacity: [0.55, 1, 0.55] } : undefined}
                transition={{ duration: 1.6, repeat: 1, ease: 'easeInOut' }}
              >
                {dryRunReady ? 'DRY-RUN READY' : 'HELD'}
              </motion.span>
              </div>
            </StoryNode>
          )}
        </div>

      </div>
    </StoryStage>
  );
}
