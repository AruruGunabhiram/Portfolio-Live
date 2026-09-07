import { useEffect, useRef, useState } from 'react';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryStage } from '../../../story/StoryStage';
import { StoryWindow } from '../../../story/StoryWindow';
import type { ProjectStoryComponentProps } from '../storyRegistry';

const ARIA_LABEL =
  'A collaborative coding session where participants stay synchronized in real time, submit shared code for Judge0 execution, and receive test results back into the session.';

const DESCRIPTION =
  'Code Battlegrounds system diagram: a coding challenge opens in a shared editor session with participant A and participant B connected. One code change propagates through Socket.IO and the room becomes synchronized. The shared submission is then queued for the integrated Judge0 execution service, which returns test feedback to the same session.';

const FINAL_STEP = 6;
const HOLD_MS = 1500;
const STEP_DELAYS = [550, 700, 800, 600, 700, 700] as const;

export function CodeBattlegroundsStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
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

  const challengeReady = isStatic || step >= 1;
  const sessionActive = isStatic || step >= 2;
  const synced = isStatic || step >= 3;
  const submissionQueued = isStatic || step >= 4;
  const executing = isStatic || step >= 5;
  const complete = isStatic || step >= 6;

  const challenge = (
    <div
      data-story-node="primary"
      data-node-id="challenge"
      className={`rounded-md border px-2.5 ${compact ? 'py-1.5' : 'py-2'} min-w-0`}
      style={{
        background: challengeReady ? 'var(--story-neutral-subtle)' : 'var(--surface)',
        borderColor: challengeReady ? 'var(--story-neutral-border)' : 'var(--border)',
        boxShadow: 'inset 2px 0 0 var(--story-neutral)',
      }}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Coding challenge
          </p>
          <p className="text-[11px] font-semibold leading-snug mt-0.5 truncate" style={{ color: 'var(--text)' }}>
            Implement function solve(input)
          </p>
        </div>
        <span className="text-[9px] font-semibold shrink-0" style={{ color: challengeReady ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
          {challengeReady ? 'READY' : 'OPENING'}
        </span>
      </div>
    </div>
  );

  const sharedSession = (
    <div data-story-node="primary" data-node-id="shared-session" className="min-w-0">
      <div
        className="rounded-md border p-0.5 min-w-0"
        style={{
          background: synced ? 'var(--story-cloud)' : 'var(--story-backend)',
          boxShadow: sessionActive ? 'var(--shadow-sm)' : 'none',
          transition: shouldAnimate ? 'background 320ms ease-out, box-shadow 320ms ease-out' : 'none',
        }}
      >
        <StoryWindow title={compact ? undefined : 'shared coding session'}>
          <div className={`flex items-center justify-between gap-2 ${compact ? 'pb-1.5' : 'pb-2'} border-b`} style={{ borderColor: 'var(--border)' }}>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>
                Shared editor
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                participant A · participant B
              </p>
            </div>
            <span className="text-[9px] font-semibold shrink-0" style={{ color: synced ? 'var(--story-cloud)' : 'var(--text-muted)' }}>
              {synced ? '2 CONNECTED · SYNCED' : sessionActive ? '2 CONNECTED' : 'CONNECTING'}
            </span>
          </div>

          {compact ? (
            <div className="mt-1.5 min-w-0">
              <div className="rounded border px-2 py-1.5 grid grid-cols-[14px_1fr] gap-x-1.5 text-[9px] leading-snug font-mono min-w-0" style={{ background: 'var(--surface)', borderColor: 'var(--story-backend-border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>1</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>function solve(input) {'{'}</span>
                <span style={{ color: 'var(--text-muted)' }}>2</span>
                <span className="truncate rounded-sm px-1 -ml-1" style={{ color: 'var(--text)', background: synced ? 'var(--story-cloud-subtle)' : 'transparent', transition: shouldAnimate ? 'background 360ms ease-out' : 'none' }}>return result {'}'}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t text-[9px]" style={{ borderColor: 'var(--border)' }}>
                <span className="font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--text)' }}>Realtime sync</span>
                <span className="font-semibold" style={{ color: synced ? 'var(--story-success)' : 'var(--story-cloud)' }}>{synced ? 'SYNCED' : sessionActive ? 'PROPAGATING' : 'WAITING'}</span>
              </div>
              <p className="text-[9px] leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>Socket.IO · one shared room state</p>
            </div>
          ) : (
            <div className="grid grid-cols-[1.45fr_.75fr] gap-2 mt-2 min-w-0">
              <div className="rounded border px-2.5 py-2 min-w-0" style={{ background: 'var(--surface)', borderColor: 'var(--story-backend-border)' }}>
                <div className="grid grid-cols-[14px_1fr] gap-x-1.5 text-[10px] leading-[1.55] font-mono min-w-0">
                  <span style={{ color: 'var(--text-muted)' }}>1</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>function solve(input) {'{'}</span>
                  <span style={{ color: 'var(--text-muted)' }}>2</span>
                  <span className="truncate rounded-sm px-1 -ml-1" style={{ color: 'var(--text)', background: synced ? 'var(--story-cloud-subtle)' : 'transparent', transition: shouldAnimate ? 'background 360ms ease-out' : 'none' }}>return result</span>
                  <span style={{ color: 'var(--text-muted)' }}>3</span><span style={{ color: 'var(--text-secondary)' }}>{'}'}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-1"><i className="w-1.5 h-3 rounded-sm" style={{ background: 'var(--story-backend)' }} />participant A</span>
                  <span className="inline-flex items-center gap-1"><i className="w-1.5 h-3 rounded-sm" style={{ background: 'var(--story-cloud)' }} />participant B</span>
                </div>
              </div>

              <div className="rounded border px-2.5 py-2 min-w-0" style={{ background: 'var(--story-cloud-subtle)', borderColor: 'var(--story-cloud-border)' }}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-semibold tracking-[0.07em] uppercase" style={{ color: 'var(--text)' }}>Realtime sync</span>
                <span className="text-[9px] font-semibold" style={{ color: synced ? 'var(--story-success)' : 'var(--story-cloud)', overflowWrap: 'normal' }}>{synced ? 'SYNCED' : sessionActive ? 'PROPAGATING' : 'WAITING'}</span>
              </div>
              <div className="relative h-4 mt-2" data-sync-path>
                <div className="absolute left-0 right-0 top-[7px] h-px" style={{ background: 'var(--story-cloud-border)' }} />
                <span
                  className="absolute top-1 w-2 h-2 rounded-full"
                  style={{
                    left: synced ? 'calc(100% - 8px)' : '0%',
                    background: 'var(--story-cloud)',
                    transition: shouldAnimate ? 'left 520ms ease-in-out' : 'none',
                  }}
                />
              </div>
              <p className="text-[9px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
                Socket.IO · one shared room state
              </p>
              </div>
            </div>
          )}
        </StoryWindow>
      </div>
    </div>
  );

  const submission = (
    <div data-story-node={compact ? undefined : 'primary'} data-node-id="submission" className="min-w-0">
      <div className="rounded-md border px-2.5 py-2 h-full" style={{ background: submissionQueued ? 'var(--story-backend-subtle)' : 'var(--surface)', borderColor: submissionQueued ? 'var(--story-backend-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-backend)' }}>
        <p className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)', overflowWrap: 'normal' }}>Submission</p>
        <p className="text-[10px] font-semibold mt-1" style={{ color: submissionQueued ? 'var(--story-backend)' : 'var(--text-muted)' }}>
          {submissionQueued ? 'submission queued' : 'shared code ready'}
        </p>
      </div>
    </div>
  );

  const execution = (
    <div data-story-node={compact ? undefined : 'primary'} data-node-id="execution" className="min-w-0">
      <div className="rounded-md border px-2.5 py-2 h-full" style={{ background: executing ? 'var(--story-automation-subtle)' : 'var(--surface)', borderColor: executing ? 'var(--story-automation-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-automation)' }}>
        <p className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)', overflowWrap: 'normal' }}>Execution engine</p>
        <p className="text-[10px] font-semibold mt-1" style={{ color: executing ? 'var(--story-automation)' : 'var(--text-muted)' }}>
          Judge0 execution · {complete ? 'complete' : executing ? 'running' : 'waiting'}
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>integrated execution service</p>
      </div>
    </div>
  );

  const compactExecute = (
    <div data-story-node="primary" data-node-id="submit-execute" className="min-w-0 rounded-md border px-2.5 py-1.5" style={{ background: executing ? 'var(--story-automation-subtle)' : submissionQueued ? 'var(--story-backend-subtle)' : 'var(--surface)', borderColor: executing ? 'var(--story-automation-border)' : submissionQueued ? 'var(--story-backend-border)' : 'var(--border)', boxShadow: `inset 2px 0 0 ${executing ? 'var(--story-automation)' : 'var(--story-backend)'}` }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)' }}>Submit → execute</span>
        <span className="text-[9px] font-semibold" style={{ color: executing ? 'var(--story-automation)' : submissionQueued ? 'var(--story-backend)' : 'var(--text-muted)' }}>{executing ? 'RUNNING' : submissionQueued ? 'QUEUED' : 'READY'}</span>
      </div>
      <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>submission queued → Judge0 execution</p>
      <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>integrated execution service</p>
    </div>
  );

  const result = (
    <div data-story-node="primary" data-node-id="result" className="min-w-0">
      <div className={`rounded-md border px-2.5 ${compact ? 'py-1.5' : 'py-2'} h-full`} style={{ background: complete ? 'var(--story-success-subtle)' : 'var(--surface)', borderColor: complete ? 'var(--story-success-border)' : 'var(--border)', boxShadow: 'inset 2px 0 0 var(--story-success)' }}>
        <div className={compact ? 'flex items-center justify-between gap-2' : 'flex flex-col gap-0.5 xl:flex-row xl:items-center xl:justify-between xl:gap-2'}>
          <p className="text-[9px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--text)', overflowWrap: 'normal' }}>Test results</p>
          <span className="text-[9px] font-semibold" style={{ color: complete ? 'var(--story-success)' : 'var(--text-muted)' }}>{complete ? 'EXECUTION COMPLETE' : executing ? 'RECEIVING' : 'HELD'}</span>
        </div>
        <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-1 xl:grid-cols-3'} gap-1 mt-1.5 text-[9px]`}>
          {['test 1', 'test 2', 'test 3'].map((test, index) => (
            <span key={test} className="rounded border px-1.5 py-1 text-center" style={{ borderColor: complete ? 'var(--story-success-border)' : 'var(--border)', color: complete ? 'var(--story-success)' : 'var(--text-muted)', background: complete ? 'var(--story-success-subtle)' : 'var(--surface-subtle)' }}>
              {test} · {complete ? 'PASS' : executing && index === 0 ? 'RUNNING' : 'WAIT'}
            </span>
          ))}
        </div>
        <p className="text-[9px] mt-1.5" style={{ color: complete ? 'var(--story-success)' : 'var(--text-muted)' }}>
          {complete ? 'feedback synchronized to shared session' : 'results return after execution'}
        </p>
      </div>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} withGrid className="overflow-hidden">
      <div ref={ref} data-phase={step} className="min-w-0" style={{ minHeight: compact ? 330 : 420 }} aria-hidden="true">
        {!compact && (
          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Collaborative coding workspace</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{isStatic ? 'Static system' : !shouldAnimate ? 'Paused offscreen' : complete ? 'Session synchronized' : 'Live shared session'}</span>
          </div>
        )}

        {challenge}
        <StoryConnector active={challengeReady} orientation="vertical" dense />
        {sharedSession}
        <StoryConnector active={synced} orientation="vertical" dense />

        {compact ? (
          <>
            {compactExecute}
            <StoryConnector active={executing} orientation="vertical" dense />
            {result}
          </>
        ) : (
          <div className="grid grid-cols-[.8fr_12px_1.05fr_12px_1.15fr] gap-1.5 min-w-0 items-stretch">
            {submission}
            <div className="flex items-center" aria-hidden="true"><span className="h-px flex-1" style={{ background: submissionQueued ? 'var(--accent)' : 'var(--border-strong)' }} /><span className="text-[9px]" style={{ color: submissionQueued ? 'var(--accent)' : 'var(--border-strong)' }}>→</span></div>
            {execution}
            <div className="flex items-center" aria-hidden="true"><span className="h-px flex-1" style={{ background: executing ? 'var(--accent)' : 'var(--border-strong)' }} /><span className="text-[9px]" style={{ color: executing ? 'var(--accent)' : 'var(--border-strong)' }}>→</span></div>
            {result}
          </div>
        )}
      </div>
    </StoryStage>
  );
}
