import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStoryLifecycle } from '../../hooks/useStoryLifecycle';
import { StoryStage } from '../story/StoryStage';
import { StoryNode } from '../story/StoryNode';
import { StoryConnector } from '../story/StoryConnector';
import { StoryStatus } from '../story/StoryStatus';

const ARIA_LABEL =
  'Controlled AI workflow where context becomes an AI-generated proposal, passes permission and human approval gates, then executes through an application and records an audit result.';
const DESCRIPTION =
  'Task context from OrkaATS enters a bounded AI reasoning step that produces a proposal; the proposal passes a permission gate, awaits human approval, then executes in the application with an audit trail.';

export function ProjxonExperienceStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isRecruiter, isReducedMotion, isCompact, isDocumentVisible } = useStoryLifecycle(ref, {
    competitive: true,
  });

  const isStatic = isRecruiter || isReducedMotion;
  const [step, setStep] = useState(() => (isStatic ? 6 : 0));

  // Drive step sequencing only when shouldAnimate; pause otherwise; force final for static
  useEffect(() => {
    if (isStatic) {
      setStep(6);
      return;
    }
    if (!shouldAnimate) return;
    if (step === 6) {
      const t = setTimeout(() => setStep(0), 2000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => Math.min(s + 1, 6)), 700);
    return () => clearTimeout(t);
  }, [step, shouldAnimate, isStatic, isDocumentVisible]);

  // Initialize static final if lifecycle later resolves to static (e.g., after mount)
  useEffect(() => {
    if (isStatic) setStep(6);
  }, [isStatic]);

  const stateFor = (idx: number): 'active' | 'completed' | 'idle' => {
    if (isStatic) return 'completed';
    if (!shouldAnimate && step === 0) {
      // not yet active, show initial idle except task which is idle? keep task active to hint
      return idx === 0 ? 'active' : 'idle';
    }
    if (step > idx) return 'completed';
    if (step === idx) return 'active';
    return 'idle';
  };

  const connectorActive = (afterIdx: number): boolean => {
    if (isStatic) return true;
    return step > afterIdx;
  };

  // For non-static but not animating (offscreen/competitive), show final-ish to communicate completeness
  // If shouldAnimate false and step is 0 (never started), keep initial; otherwise keep current step (paused)

  const showFinalAudit = isStatic || step >= 5;

  const stageHeight = isCompact ? 300 : 260;

  return (
    <StoryStage
      ariaLabel={ARIA_LABEL}
      description={DESCRIPTION}
      withGrid
      className="overflow-hidden"
    >
      <div ref={ref} className="min-w-0" style={{ minHeight: stageHeight }}>
        <div className="flex items-center justify-between gap-2 mb-3 min-w-0 flex-wrap">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
            Controlled workflow — current
          </span>
          <span className="text-[10px] leading-none px-1.5 py-1 rounded" style={{ background: 'var(--story-neutral-subtle)', border: '1px solid var(--story-neutral-border)', color: 'var(--text-muted)' }} aria-hidden="true">
            OrkaATS · operational workflow tooling
          </span>
        </div>

        {isCompact ? (
          // Compact: vertical stack
          <div className="flex flex-col items-center gap-0 min-w-0">
            <motion.div
              className="w-full max-w-[260px]"
              animate={stateFor(0) === 'active' && shouldAnimate ? { scale: [1, 1.02, 1] } : undefined}
              transition={shouldAnimate ? { duration: 1.4, repeat: stateFor(0) === 'active' ? Infinity : 0 } : undefined}
            >
              <StoryNode variant="neutral" label="Task context" detail="workflow input" state={stateFor(0)} />
            </motion.div>
            <StoryConnector active={connectorActive(0)} orientation="vertical" />
            <div className="w-full max-w-[260px]">
              <StoryNode variant="ai" subtle label="AI proposal" detail="bounded reasoning" state={stateFor(1)} />
            </div>
            <StoryConnector active={connectorActive(1)} orientation="vertical" />
            <div className="w-full max-w-[260px]">
              <StoryNode variant="automation" subtle label="Permission gate" detail="policy check" state={stateFor(2)} />
            </div>
            <StoryConnector active={connectorActive(2)} orientation="vertical" />
            <div className="w-full max-w-[260px]">
              <StoryNode variant="neutral" label="Human approval" detail="approval required" state={stateFor(3)} />
            </div>
            <StoryConnector active={connectorActive(3)} orientation="vertical" />
            <div className="w-full max-w-[260px]">
              <StoryNode variant="backend" label="App execution" detail="application-owned" state={stateFor(4)} />
            </div>
            <div className="mt-3 w-full max-w-[260px] flex justify-center" aria-hidden="true">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border"
                style={{
                  background: showFinalAudit ? 'var(--story-success-subtle)' : 'var(--surface)',
                  borderColor: showFinalAudit ? 'var(--story-success-border)' : 'var(--border)',
                  color: showFinalAudit ? 'var(--story-success)' : 'var(--text-muted)',
                  opacity: showFinalAudit ? 1 : 0.6,
                }}
              >
                <span aria-hidden="true">{showFinalAudit ? '✓' : '•'}</span>
                Audit trail — {showFinalAudit ? 'recorded' : 'pending'}
              </span>
            </div>
          </div>
        ) : (
          // Desktop: horizontal flow with wrap, audit as footer
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 justify-start min-w-0">
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="neutral" label="Task context" detail="workflow input" state={stateFor(0)} />
              </div>
              <StoryConnector active={connectorActive(0)} orientation="horizontal" />
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="ai" subtle label="AI proposal" detail="bounded reasoning" state={stateFor(1)} />
              </div>
              <StoryConnector active={connectorActive(1)} orientation="horizontal" />
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="automation" subtle label="Permission gate" detail="policy check" state={stateFor(2)} />
              </div>
              <StoryConnector active={connectorActive(2)} orientation="horizontal" />
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="neutral" label="Human approval" detail="approval required" state={stateFor(3)} />
              </div>
              <StoryConnector active={connectorActive(3)} orientation="horizontal" />
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="backend" label="App execution" detail="application-owned" state={stateFor(4)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end min-w-0">
              <motion.div
                animate={showFinalAudit && shouldAnimate ? { scale: [1, 1.03, 1] } : undefined}
                transition={shouldAnimate && showFinalAudit ? { duration: 1.2, repeat: 2 } : undefined}
                aria-hidden="true"
              >
                <StoryStatus variant={showFinalAudit ? 'success' : 'neutral'} label="Audit trail" detail={showFinalAudit ? 'recorded' : 'pending'} />
              </motion.div>
            </div>
          </div>
        )}
        <p className="text-[10px] leading-snug mt-3 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          {isStatic ? 'Static system' : shouldAnimate ? 'Controlled · permission → approval → execution → audit' : 'Paused · approval required before execution'}
        </p>
      </div>
    </StoryStage>
  );
}
