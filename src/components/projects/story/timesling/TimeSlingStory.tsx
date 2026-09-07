import { useEffect, useRef, useState } from 'react';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryStage } from '../../../story/StoryStage';
import { StoryWindow } from '../../../story/StoryWindow';
import type { ProjectStoryComponentProps } from '../storyRegistry';

const ARIA_LABEL =
  'A macOS menu-bar timer utility where preset or custom timers can be created, arranged into a compact stack, run concurrently, and surface a prominent completion notification.';

const DESCRIPTION =
  'TimeSling product interaction: a preset or custom duration becomes a named timer in a menu-bar utility. Multiple timers compact into a stack, show distinct progress states together, and Deep work ends with a prominent fullscreen completion surface.';

const FINAL_STEP = 6;
const HOLD_MS = 1350;
const STEP_DELAYS = [520, 620, 650, 620, 650, 650] as const;

type Timer = { name: string; remaining: string; width: string; color: string };

const TIMERS: Timer[] = [
  { name: 'Deep work', remaining: '24:42', width: '76%', color: 'var(--accent)' },
  { name: 'Tea', remaining: '04:42', width: '48%', color: 'var(--story-cloud)' },
  { name: 'Stretch', remaining: '00:42', width: '18%', color: 'var(--story-success)' },
];

export function TimeSlingStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
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

  const created = isStatic || step >= 1;
  const stacked = isStatic || step >= 3;
  const concurrent = isStatic || step >= 4;
  const complete = isStatic || step >= FINAL_STEP;
  const showAllTimers = stacked || complete;
  const progressVisible = concurrent || complete;
  const conceptCount = compact ? 4 : 5;

  const timerRows = TIMERS.slice(0, showAllTimers ? 3 : created ? 1 : 0).map((timer, index) => {
    const moved = stacked && index === 1;
    return (
      <div
        key={timer.name}
        className="rounded border px-2 py-1.5 min-w-0"
        style={{
          background: index === 0 ? 'var(--surface)' : 'var(--surface-subtle)',
          borderColor: index === 0 ? 'var(--accent)' : 'var(--border)',
          transform: moved ? 'translateX(7px)' : 'translateX(0)',
          transition: shouldAnimate ? 'transform 380ms cubic-bezier(.2,.8,.2,1), border-color 300ms ease-out' : 'none',
        }}
      >
        <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
          <span className="font-semibold truncate" style={{ color: 'var(--text)' }}>{timer.name}</span>
          <span className="font-mono shrink-0" style={{ color: 'var(--text-secondary)' }}>
            {progressVisible ? timer.remaining : index === 0 ? '25:00' : index === 1 ? '05:00' : '01:00'}
          </span>
        </div>
        <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--border)' }}>
          <span
            className="block h-full rounded-full"
            style={{
              width: progressVisible ? timer.width : index === 0 ? '82%' : '0%',
              background: timer.color,
              transition: shouldAnimate ? 'width 520ms ease-out' : 'none',
            }}
          />
        </div>
      </div>
    );
  });

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} className="overflow-hidden">
      <div
        ref={ref}
        data-phase={step}
        data-concept-count={conceptCount}
        className="relative min-w-0"
        style={{ minHeight: compact ? 230 : 278 }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Menu-bar utility
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>dock-free</span>
        </div>

        <div data-story-node="primary" data-node-id="create-timer" className="rounded-md border px-2.5 py-2" style={{ background: 'var(--story-automation-subtle)', borderColor: 'var(--story-automation-border)' }}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>Create timer</span>
            <span className="text-[9px] font-medium" style={{ color: 'var(--story-automation)' }}>
              {created ? '12:00 → added' : 'preset or custom'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-medium">
            {['5m', '15m', '30m'].map((preset, index) => (
              <span key={preset} className="rounded px-1.5 py-1 border" style={{ background: created && index === 1 ? 'var(--surface)' : 'transparent', borderColor: created && index === 1 ? 'var(--story-automation)' : 'var(--story-automation-border)', color: 'var(--text-secondary)' }}>{preset}</span>
            ))}
            <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>custom drag</span>
          </div>
        </div>

        <div className={`relative mx-auto w-px ${compact ? 'h-2' : 'h-3'}`} style={{ background: created ? 'var(--accent)' : 'var(--border-strong)' }} />

        <div data-story-node="primary" data-node-id="timer-panel" className="relative mx-auto max-w-[310px]">
          <StoryWindow
            title="TimeSling · menu-bar panel"
            className={compact ? '[&>div:first-child]:px-2 [&>div:first-child]:py-1 [&>div:last-child]:p-2' : ''}
          >
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>Running timers</span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{showAllTimers ? '3 active' : created ? '1 active' : 'ready'}</span>
            </div>
            <div className="space-y-1.5">{timerRows}</div>
          </StoryWindow>

          <div data-story-node="primary" data-node-id="timer-stack" className="absolute -right-1 -bottom-2 rounded border px-1.5 py-1 text-[9px] font-semibold" style={{ color: stacked ? 'var(--accent)' : 'var(--text-muted)', background: 'var(--surface)', borderColor: stacked ? 'var(--accent)' : 'var(--border)', transform: stacked ? 'translateY(0)' : 'translateY(-8px)', opacity: stacked ? 1 : 0.55, transition: shouldAnimate ? 'transform 380ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease-out' : 'none' }}>
            {stacked ? 'snapped stack' : 'arrange'}
          </div>
        </div>

        <div className={`grid gap-2 ${compact ? 'mt-2' : 'mt-4'}`} style={{ gridTemplateColumns: compact ? '1fr' : '1fr 1fr' }}>
          <div data-story-node="primary" data-node-id="concurrent-timers" className="rounded border px-2 py-1.5" style={{ background: progressVisible ? 'var(--story-cloud-subtle)' : 'var(--surface)', borderColor: progressVisible ? 'var(--story-cloud-border)' : 'var(--border)' }}>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text)' }}>Concurrent state</span>
            <span className="block text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{progressVisible ? 'distinct progress · 3 timers' : 'timers join the stack'}</span>
          </div>
          {!compact && (
            <div data-story-node="primary" data-node-id="completion-notification" className="rounded border px-2 py-1.5" style={{ background: complete ? 'var(--story-success-subtle)' : 'var(--surface)', borderColor: complete ? 'var(--story-success-border)' : 'var(--border)' }}>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text)' }}>Completion surface</span>
              <span className="block text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{complete ? 'fullscreen capable' : 'awaiting timer'}</span>
            </div>
          )}
        </div>

        {complete && (
          <div className="absolute inset-x-2 top-[71px] bottom-0 flex items-center justify-center rounded-md border" style={{ background: 'var(--surface-raised, var(--surface))', borderColor: 'var(--story-success-border)', boxShadow: 'var(--shadow-md)', animation: shouldAnimate ? 'none' : undefined }}>
            <div className="text-center px-4">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--story-success)' }}>Timer complete</p>
              <p className="text-base font-semibold mt-1" style={{ color: 'var(--text)' }}>Deep work</p>
              <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>prominent completion surface</p>
            </div>
          </div>
        )}

        <p className={`text-[9px] text-center ${compact ? 'mt-1' : 'mt-2'}`} style={{ color: 'var(--text-muted)' }}>
          {isStatic ? 'Static product state' : shouldAnimate ? 'preset → create → stack → complete' : 'Paused offscreen'}
        </p>
      </div>
    </StoryStage>
  );
}
