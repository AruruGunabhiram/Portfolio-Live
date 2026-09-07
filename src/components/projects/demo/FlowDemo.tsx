import { useEffect, useRef, useState, useCallback, useId } from 'react';
import type { FlowDemo } from '../../../types/portfolio';
import { usePortfolioMode } from '../../../context/PortfolioModeContext';

interface FlowDemoProps {
  demo: FlowDemo;
}

// ─── One-active-demo coordination (8AF) ──────────────────────────
// Without global state: all FlowDemos share a module-level observer that
// picks the most-visible demo as the only active one. Lightweight, no context.
type RegistryEntry = { ratio: number; setActive: (v: boolean) => void };
const registry = new Map<string, RegistryEntry>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        const id = (e.target as HTMLElement).dataset.demoId;
        if (!id) return;
        const ent = registry.get(id);
        if (ent) ent.ratio = e.intersectionRatio;
      });
      let bestId: string | null = null;
      let bestRatio = 0.2;
      registry.forEach((ent, id) => {
        if (ent.ratio >= bestRatio) {
          bestRatio = ent.ratio;
          bestId = id;
        }
      });
      registry.forEach((ent, id) => ent.setActive(id === bestId));
    },
    { threshold: [0, 0.2, 0.5, 0.75] }
  );
  return sharedObserver;
}

export function FlowDemo({ demo }: FlowDemoProps) {
  const steps = demo.steps;
  const totalDuration = demo.durationMs ?? 6400;
  const stepDuration = steps.length > 0 ? totalDuration / steps.length : 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const demoId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMostVisible, setIsMostVisible] = useState(false);
  const [isDocVisible, setIsDocVisible] = useState(() => typeof document === 'undefined' ? true : document.visibilityState === 'visible');
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { isRecruiter: modeIsRecruiter } = usePortfolioMode();

  // reduced motion init + listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // viewport — shared one-active coordination
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.dataset.demoId = demoId;
    const entry: RegistryEntry = { ratio: 0, setActive: setIsMostVisible };
    registry.set(demoId, entry);
    const obs = getSharedObserver();
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      registry.delete(demoId);
      // re-evaluate remaining
      let bestId: string | null = null;
      let bestRatio = 0.2;
      registry.forEach((ent, id) => {
        if (ent.ratio >= bestRatio) {
          bestRatio = ent.ratio;
          bestId = id;
        }
      });
      registry.forEach((ent, id) => ent.setActive(id === bestId));
    };
  }, [demoId]);

  // document visibility
  useEffect(() => {
    const handler = () => setIsDocVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const shouldAnimate = !reduced && !modeIsRecruiter && isMostVisible && isDocVisible && steps.length > 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // loop playback — stable restart, cleanup on deps change/unmount
  useEffect(() => {
    clearTimer();
    if (!shouldAnimate || stepDuration <= 0) return;

    const scheduleNext = (fn: () => void, delay: number) => {
      timerRef.current = window.setTimeout(fn, delay);
    };

    const tick = () => {
      setActiveIndex(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          scheduleNext(() => {
            setActiveIndex(0);
            scheduleNext(tick, stepDuration);
          }, 900);
          return prev;
        }
        scheduleNext(tick, stepDuration);
        return next;
      });
    };

    scheduleNext(tick, stepDuration);
    return clearTimer;
  }, [shouldAnimate, stepDuration, steps.length, clearTimer]);

  useEffect(() => {
    if (!isMostVisible || !isDocVisible) {
      clearTimer();
    }
  }, [isMostVisible, isDocVisible, clearTimer]);

  // reduced motion or recruiter: static complete flow
  const isStatic = reduced || modeIsRecruiter;

  const connectorActive = (idx: number) => {
    if (isStatic) return true;
    return idx < activeIndex;
  };

  const stepState = (idx: number): 'active' | 'completed' | 'idle' => {
    if (isStatic) return 'completed';
    if (idx === activeIndex) return 'active';
    if (idx < activeIndex) return 'completed';
    return 'idle';
  };

  // aria summary for screen readers (no aria-live)
  const summary = steps.map(s => s.label).join(' → ');

  return (
    <div
      ref={containerRef}
      aria-label={demo.ariaLabel ?? `Flow: ${summary}`}
      role="img"
      className="rounded-md border p-3 sm:p-5 min-w-0"
      style={{
        background: 'var(--surface-subtle)',
        borderColor: 'var(--border)',
        minHeight: '200px',
        overflowWrap: 'anywhere' as const,
      }}
    >
      <p className="sr-only">{summary}</p>
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
        Flow
      </p>

      <div className="flex flex-col items-center">
        {steps.map((step, idx) => {
          const state = stepState(idx);
          const isActive = state === 'active';
          const isCompleted = state === 'completed';

          return (
            <div key={step.id} className="flex flex-col items-center w-full">
              <div
                className="w-full max-w-[280px] rounded-md border px-3 py-2.5 sm:py-3 text-center transition-colors min-w-0"
                style={{
                  background: isCompleted && !isActive ? 'var(--accent-subtle)' : 'var(--surface)',
                  borderColor: isActive ? 'var(--border-strong)' : isCompleted ? 'var(--border)' : 'var(--border)',
                  opacity: state === 'idle' ? 0.72 : 1,
                  transform: 'translateZ(0)',
                  overflowWrap: 'anywhere' as const,
                }}
              >
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: isActive ? 'var(--accent)' : isCompleted ? 'var(--accent)' : 'var(--border-strong)',
                      opacity: isActive ? 1 : isCompleted ? 0.9 : 0.5,
                    }}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold leading-snug break-words min-w-0" style={{ color: isActive || isCompleted ? 'var(--text)' : 'var(--text-muted)', overflowWrap: 'anywhere' as const }}>
                    {step.label}
                  </p>
                </div>
                {step.detail && (
                  <p className="text-[11px] leading-snug mt-1 break-words" style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' as const }}>
                    {step.detail}
                  </p>
                )}
              </div>

              {idx < steps.length - 1 && (
                <div className="flex flex-col items-center py-1.5" aria-hidden="true">
                  {/* thin connector — muted → accent */}
                  <div
                    className="w-px h-5 transition-colors"
                    style={{
                      background: (isStatic || connectorActive(idx)) ? 'var(--accent)' : 'var(--border-strong)',
                      opacity: (isStatic || connectorActive(idx)) ? 0.9 : 0.5,
                    }}
                  />
                  <span
                    className="text-[10px] leading-none mt-0.5"
                    style={{
                      color: (isStatic || connectorActive(idx)) ? 'var(--accent)' : 'var(--border-strong)',
                      opacity: (isStatic || connectorActive(idx)) ? 0.9 : 0.5,
                    }}
                  >
                    ↓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] leading-snug mt-3 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
        {isStatic ? 'Static flow (reduced motion)' : isMostVisible && isDocVisible ? 'Looping · pauses offscreen' : 'Paused offscreen'}
      </p>
    </div>
  );
}
