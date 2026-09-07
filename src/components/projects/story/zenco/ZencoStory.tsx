import { useEffect, useRef, useState } from 'react';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryStage } from '../../../story/StoryStage';
import { StoryWindow } from '../../../story/StoryWindow';
import type { ProjectStoryComponentProps } from '../storyRegistry';

const ARIA_LABEL =
  'A collaborative developer-tooling workflow where a VS Code extension sends an editor action across a stable interface to a Python CLI engine and returns the result into the editor.';

const DESCRIPTION =
  'Zenco integration diagram: an editor workspace invokes an extension command. The VS Code extension uses the VS Code API to send a request across a stable interface to a separate Python CLI engine for analysis or transformation. The resulting insight returns to the editor workflow.';

const FINAL_STEP = 5;
const STEP_DELAYS = [520, 620, 700, 650, 620] as const;
const HOLD_MS = 1250;

export function ZencoStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
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
    const timer = setTimeout(() => setStep(current => (current >= FINAL_STEP ? 0 : current + 1)), delay);
    return () => clearTimeout(timer);
  }, [step, shouldAnimate, isStatic, isDocumentVisible]);

  useEffect(() => {
    if (isStatic) setStep(FINAL_STEP);
  }, [isStatic]);

  const commandActive = isStatic || step >= 1;
  const requestSent = isStatic || step >= 2;
  const engineReady = isStatic || step >= 3;
  const resultReturned = isStatic || step >= FINAL_STEP;
  const conceptCount = compact ? 4 : 5;
  const transition = shouldAnimate ? 'background 350ms ease-out, border-color 350ms ease-out, opacity 350ms ease-out, transform 420ms cubic-bezier(.2,.8,.2,1)' : 'none';

  const editor = (
    <div data-story-node="primary" data-node-id="editor-workspace" className="min-w-0">
      <StoryWindow title="workspace · file.ts" className={compact ? '[&>div:first-child]:px-2 [&>div:first-child]:py-1 [&>div:last-child]:p-2' : ''}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Editor workspace</span>
          <span className="rounded border px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: commandActive ? 'var(--story-cloud-subtle)' : 'var(--surface)', borderColor: commandActive ? 'var(--story-cloud-border)' : 'var(--border)', color: commandActive ? 'var(--story-cloud)' : 'var(--text-muted)', transition }}>ANALYZE</span>
        </div>
        <div className="rounded border px-2 py-1.5 grid grid-cols-[14px_1fr] gap-x-1.5 text-[9px] leading-[1.55] font-mono min-w-0" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>1</span><span style={{ color: 'var(--text-secondary)' }}>const selection = input</span>
          <span style={{ color: 'var(--text-muted)' }}>2</span><span className="rounded-sm px-1 -ml-1 truncate" style={{ color: 'var(--text)', background: resultReturned ? 'var(--story-success-subtle)' : commandActive ? 'var(--story-cloud-subtle)' : 'transparent', transition }}>{resultReturned ? 'result available in workflow' : 'selected region'}</span>
        </div>
      </StoryWindow>
    </div>
  );

  const extension = (
    <div data-story-node="primary" data-node-id="extension-layer" className="rounded-md border px-2.5 py-2 min-w-0" style={{ background: commandActive ? 'var(--story-cloud-subtle)' : 'var(--surface)', borderColor: commandActive ? 'var(--story-cloud-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-cloud)', transition }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>VS Code extension</span>
        <span className="text-[9px] font-semibold" style={{ color: commandActive ? 'var(--story-cloud)' : 'var(--text-muted)' }}>{commandActive ? 'COMMAND ACTIVE' : 'READY'}</span>
      </div>
      <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>editor command · VS Code API</p>
    </div>
  );

  const boundary = (
    <div data-story-node={compact ? undefined : 'primary'} data-node-id="stable-interface" className="rounded-md border px-2.5 py-1.5 min-w-0" style={{ background: requestSent ? 'var(--accent-subtle)' : 'var(--surface)', borderColor: requestSent ? 'var(--accent)' : 'var(--border)', transition }}>
      <div className="flex items-center justify-between gap-2 text-[9px]">
        <span className="font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Stable interface</span>
        <span className="font-mono" style={{ color: requestSent ? 'var(--accent)' : 'var(--text-muted)' }}>{resultReturned ? 'request ↔ response' : requestSent ? 'request →' : 'boundary'}</span>
      </div>
    </div>
  );

  const engine = (
    <div data-story-node="primary" data-node-id="python-cli-engine" className="rounded-md border px-2.5 py-2 min-w-0" style={{ background: engineReady ? 'var(--story-automation-subtle)' : 'var(--surface)', borderColor: engineReady ? 'var(--story-automation-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-automation)', transition }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Python CLI engine</span>
        <span className="text-[9px] font-semibold" style={{ color: engineReady ? 'var(--story-automation)' : 'var(--text-muted)' }}>{engineReady ? 'PROCESSING' : 'WAITING'}</span>
      </div>
      <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>analysis / transformation</p>
    </div>
  );

  const result = (
    <div data-story-node="primary" data-node-id="result-returned" className="rounded-md border px-2.5 py-2 min-w-0" style={{ background: resultReturned ? 'var(--story-success-subtle)' : 'var(--surface)', borderColor: resultReturned ? 'var(--story-success-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-success)', transition }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Editor result</span>
        <span className="text-[9px] font-semibold" style={{ color: resultReturned ? 'var(--story-success)' : 'var(--text-muted)' }}>{resultReturned ? 'RETURNED' : 'PENDING'}</span>
      </div>
      <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>insight returned to workflow</p>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} className="overflow-hidden">
      <div ref={ref} data-phase={step} data-concept-count={conceptCount} className="min-w-0" style={{ minHeight: compact ? 252 : 294 }} aria-hidden="true">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Collaborative tooling project</span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{isStatic ? 'Static workflow' : !shouldAnimate ? 'Paused offscreen' : resultReturned ? 'Result returned' : 'Editor integration'}</span>
        </div>
        {editor}
        <StoryConnector active={commandActive} orientation="vertical" dense />
        {extension}
        {compact ? (
          <>
            <div className="flex items-center justify-center py-1 text-[9px] font-medium" style={{ color: requestSent ? 'var(--accent)' : 'var(--text-muted)' }}>Stable interface · {resultReturned ? 'response returned' : requestSent ? 'request sent' : 'boundary'}</div>
            {engine}
            <StoryConnector active={resultReturned} orientation="vertical" dense />
            {result}
          </>
        ) : (
          <>
            <StoryConnector active={requestSent} orientation="vertical" dense />
            {boundary}
            <StoryConnector active={engineReady} orientation="vertical" dense />
            <div className="grid grid-cols-[1fr_18px_1fr] gap-1.5 items-stretch min-w-0">
              {engine}
              <div className="flex flex-col items-center justify-center gap-1 text-[9px] font-medium" style={{ color: resultReturned ? 'var(--story-success)' : 'var(--text-muted)' }}><span>→</span><span>←</span></div>
              {result}
            </div>
          </>
        )}
      </div>
    </StoryStage>
  );
}
