import { useRef, useState, useEffect } from 'react';
import { useStoryLifecycle } from '../../hooks/useStoryLifecycle';
import { StoryStage } from '../story/StoryStage';
import { StoryNode } from '../story/StoryNode';
import { StoryConnector } from '../story/StoryConnector';
import { StoryStatus } from '../story/StoryStatus';

const ARIA_LABEL =
  'Backend software workflow where a request enters a Flask service, is processed, and returns a response.';
const DESCRIPTION =
  'An incoming request is handled by a Flask backend service, processed with backend logic, and returns a response.';

export function InfiniAIExperienceStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isRecruiter, isReducedMotion, isCompact, isDocumentVisible } = useStoryLifecycle(ref, {
    competitive: true,
  });

  const isStatic = isRecruiter || isReducedMotion;
  const [step, setStep] = useState(() => (isStatic ? 3 : 0));

  useEffect(() => {
    if (isStatic) {
      setStep(3);
      return;
    }
    if (!shouldAnimate) return;
    if (step === 3) {
      const t = setTimeout(() => setStep(0), 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => Math.min(s + 1, 3)), 750);
    return () => clearTimeout(t);
  }, [step, shouldAnimate, isStatic, isDocumentVisible]);

  useEffect(() => {
    if (isStatic) setStep(3);
  }, [isStatic]);

  const stateFor = (idx: number): 'active' | 'completed' | 'idle' => {
    if (isStatic) return 'completed';
    if (!shouldAnimate && step === 0) return idx === 0 ? 'active' : 'idle';
    if (step > idx) return 'completed';
    if (step === idx) return 'active';
    return 'idle';
  };

  const connectorActive = (afterIdx: number): boolean => {
    if (isStatic) return true;
    return step > afterIdx;
  };

  const showResponse = isStatic || step >= 2;
  const stageHeight = isCompact ? 200 : 180;

  return (
    <StoryStage
      ariaLabel={ARIA_LABEL}
      description={DESCRIPTION}
      withGrid
      className="overflow-hidden"
    >
      <div ref={ref} className="min-w-0" style={{ minHeight: stageHeight }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
            Backend service — Python / Flask
          </span>
          <span className="text-[10px] px-1.5 py-1 rounded border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }} aria-hidden="true">
            Restrained
          </span>
        </div>

        {isCompact ? (
          <div className="flex flex-col items-center gap-0 min-w-0">
            <div className="w-full max-w-[260px]">
              <StoryNode variant="neutral" label="Request" detail="incoming input" state={stateFor(0)} />
            </div>
            <StoryConnector active={connectorActive(0)} orientation="vertical" dense />
            <div className="w-full max-w-[260px]">
              <StoryNode variant="backend" subtle label="Flask service" detail="Python · backend logic" state={stateFor(1)} />
            </div>
            <StoryConnector active={connectorActive(1)} orientation="vertical" dense />
            <div className="w-full max-w-[260px] flex flex-col items-center gap-2">
              <StoryNode variant="neutral" label="Response" detail={showResponse ? '200 · processed' : 'pending'} state={showResponse ? 'completed' : 'idle'} />
              <StoryStatus variant={showResponse ? 'success' : 'neutral'} label="Response" detail={showResponse ? 'returned' : 'pending'} />
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 justify-start min-w-0">
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="neutral" label="Request" detail="incoming input" state={stateFor(0)} />
              </div>
              <StoryConnector active={connectorActive(0)} orientation="horizontal" />
              <div className="min-w-0 w-[170px]">
                <StoryNode variant="backend" subtle label="Flask service" detail="Python · backend logic" state={stateFor(1)} />
              </div>
              <StoryConnector active={connectorActive(1)} orientation="horizontal" />
              <div className="min-w-0 w-[148px]">
                <StoryNode variant="neutral" label="Response" detail={showResponse ? '200 · processed' : 'pending'} state={showResponse ? 'completed' : 'idle'} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <StoryStatus variant={showResponse ? 'success' : 'neutral'} label="Response" detail={showResponse ? 'returned' : 'pending'} />
            </div>
          </div>
        )}
        <p className="text-[10px] leading-snug mt-3 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          {isStatic ? 'Static system' : shouldAnimate ? 'Request → Flask processing → response' : 'Paused · backend handling'}
        </p>
      </div>
    </StoryStage>
  );
}
