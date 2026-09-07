import { useEffect, useRef, useState } from 'react';
import { useStoryLifecycle } from '../../../../hooks/useStoryLifecycle';
import { StoryConnector } from '../../../story/StoryConnector';
import { StoryStage } from '../../../story/StoryStage';
import type { ProjectStoryComponentProps } from '../storyRegistry';

const ARIA_LABEL =
  'A browser extension workflow where copied text is captured, stored locally as reusable snippets, and later retrieved for reuse.';

const DESCRIPTION =
  'Nostalgia product story: a synthetic selected text snippet is captured in an extension popup, saved locally in the browser as part of a small snippet collection, then retrieved ready to paste.';

const FINAL_STEP = 4;
const STEP_DELAYS = [460, 540, 620, 560] as const;
const HOLD_MS = 1050;

const SNIPPETS = ['follow-up template', 'terminal command', 'reference text'] as const;

export function NostalgiaStory({ compact: compactProp }: ProjectStoryComponentProps = {}) {
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

  const captured = isStatic || step >= 1;
  const saved = isStatic || step >= 2;
  const collectionVisible = isStatic || step >= 3;
  const reused = isStatic || step >= FINAL_STEP;
  const transition = shouldAnimate
    ? 'background 280ms ease-out, border-color 280ms ease-out, opacity 320ms ease-out, transform 360ms cubic-bezier(.2,.8,.2,1)'
    : 'none';
  const conceptCount = compact ? 3 : 4;

  const source = (
    <div
      data-story-node="primary"
      data-node-id={compact ? 'capture' : 'source-selection'}
      className="rounded-md border px-2.5 py-2 min-w-0"
      style={{
        background: captured ? 'var(--accent-subtle)' : 'var(--surface)',
        borderColor: captured ? 'var(--accent)' : 'var(--border)',
        transition,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text)' }}>
          {compact ? 'Capture copied text · extension' : 'Source selection'}
        </span>
        <span className="text-[9px] font-medium" style={{ color: captured ? 'var(--accent)' : 'var(--text-muted)' }}>
          {captured ? 'CAPTURED' : 'SELECTED'}
        </span>
      </div>
      <p className="mt-1 rounded px-1.5 py-1 text-[10px] truncate" style={{ color: 'var(--text-secondary)', background: captured ? 'var(--surface)' : 'var(--surface-subtle)' }}>
        “Reusable text snippet”
      </p>
    </div>
  );

  const extension = !compact && (
    <div
      data-story-node="primary"
      data-node-id="extension-capture"
      className="rounded-md border px-2.5 py-2 min-w-0"
      style={{
        background: captured ? 'var(--story-cloud-subtle)' : 'var(--surface)',
        borderColor: captured ? 'var(--story-cloud-border)' : 'var(--border)',
        boxShadow: 'inset 2px 0 0 var(--story-cloud)',
        transition,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text)' }}>Nostalgia extension</span>
        <span className="text-[9px] font-medium" style={{ color: captured ? 'var(--story-cloud)' : 'var(--text-muted)' }}>{captured ? 'SAVED' : 'READY'}</span>
      </div>
      <p className="mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>Save copied text · popup</p>
    </div>
  );

  const library = (
    <div
      data-story-node="primary"
      data-node-id="saved-snippets"
      className="rounded-md border px-2.5 py-2 min-w-0"
      style={{
        background: saved ? 'var(--story-automation-subtle)' : 'var(--surface)',
        borderColor: saved ? 'var(--story-automation-border)' : 'var(--border)',
        boxShadow: 'inset 2px 0 0 var(--story-automation)',
        transition,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text)' }}>Saved snippets</span>
        <span className="text-[9px] font-medium" style={{ color: saved ? 'var(--story-automation)' : 'var(--text-muted)' }}>LOCAL STORAGE</span>
      </div>
      <p className="mt-0.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>stored locally in browser</p>
      <div className="mt-1.5 space-y-1">
        {SNIPPETS.slice(0, collectionVisible ? 3 : 1).map((snippet, index) => (
          <div key={snippet} className="flex items-center gap-1.5 rounded border px-1.5 py-1 text-[9px] min-w-0" style={{ background: 'var(--surface)', borderColor: index === 0 && reused ? 'var(--story-success-border)' : 'var(--border)', opacity: collectionVisible || index === 0 ? 1 : 0.55, transform: collectionVisible || index === 0 ? 'translateY(0)' : 'translateY(-4px)', transition }}>
            <span className="font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>0{index + 1}</span>
            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{snippet}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const reuse = (
    <div
      data-story-node="primary"
      data-node-id="reuse-snippet"
      className="rounded-md border px-2.5 py-2 min-w-0"
      style={{
        background: reused ? 'var(--story-success-subtle)' : 'var(--surface)',
        borderColor: reused ? 'var(--story-success-border)' : 'var(--border)',
        boxShadow: 'inset 2px 0 0 var(--story-success)',
        transition,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text)' }}>Reuse snippet</span>
        <span className="text-[9px] font-medium" style={{ color: reused ? 'var(--story-success)' : 'var(--text-muted)' }}>{reused ? 'READY' : 'RETRIEVE'}</span>
      </div>
      <p className="mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>{reused ? 'snippet restored · ready to paste' : 'retrieve from saved collection'}</p>
    </div>
  );

  return (
    <StoryStage ariaLabel={ARIA_LABEL} description={DESCRIPTION} className="overflow-hidden">
      <div ref={ref} data-phase={step} data-concept-count={conceptCount} className="min-w-0" style={{ minHeight: compact ? 228 : 274 }} aria-hidden="true">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>Compact extension workflow</span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{isStatic ? 'Static workflow' : !shouldAnimate ? 'Paused offscreen' : reused ? 'Ready to reuse' : 'Capture → local save'}</span>
        </div>
        {source}
        <StoryConnector active={captured} orientation="vertical" dense />
        {extension}
        {!compact && <StoryConnector active={saved} orientation="vertical" dense />}
        {library}
        <StoryConnector active={reused} orientation="vertical" dense />
        {reuse}
      </div>
    </StoryStage>
  );
}
