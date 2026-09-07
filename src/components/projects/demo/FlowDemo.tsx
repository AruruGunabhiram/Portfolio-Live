import { useEffect, useRef, useState, useCallback } from 'react';
import type { FlowDemo } from '../../../types/portfolio';

interface FlowDemoProps {
  demo: FlowDemo;
}

export function FlowDemo({ demo }: FlowDemoProps) {
  const steps = demo.steps;
  const totalDuration = demo.durationMs ?? 6400;
  const stepDuration = steps.length > 0 ? totalDuration / steps.length : 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isDocVisible, setIsDocVisible] = useState(() => typeof document === 'undefined' ? true : document.visibilityState === 'visible');
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<number | null>(null);

  // reduced motion init + listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        const e = entries[0];
        setIsInViewport(e.isIntersecting && e.intersectionRatio >= 0.2);
      },
      { threshold: [0, 0.2, 0.5] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // document visibility
  useEffect(() => {
    const handler = () => setIsDocVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const shouldAnimate = !reduced && isInViewport && isDocVisible && steps.length > 1;

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
          // pause at end, then restart loop
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

  // reset when becoming invisible/hidden so loop restarts cleanly when returning
  useEffect(() => {
    if (!isInViewport || !isDocVisible) {
      clearTimer();
    } else if (shouldAnimate) {
      // ensure active index advances from current; no reset needed
    }
  }, [isInViewport, isDocVisible, shouldAnimate, clearTimer]);

  // reduced motion: static complete flow
  const isStatic = reduced;

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
      className="rounded-md border p-4 sm:p-5"
      style={{
        background: 'var(--surface-subtle)',
        borderColor: 'var(--border)',
        minHeight: '220px', // stable height, avoids layout shift
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
                className="w-full max-w-[300px] rounded-md border px-3 py-3 text-center transition-colors"
                style={{
                  background: isCompleted && !isActive ? 'var(--accent-subtle)' : 'var(--surface)',
                  borderColor: isActive ? 'var(--border-strong)' : isCompleted ? 'var(--border)' : 'var(--border)',
                  opacity: state === 'idle' ? 0.72 : 1,
                  transform: 'translateZ(0)', // composite
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: isActive ? 'var(--accent)' : isCompleted ? 'var(--accent)' : 'var(--border-strong)',
                      opacity: isActive ? 1 : isCompleted ? 0.9 : 0.5,
                    }}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold leading-tight" style={{ color: isActive || isCompleted ? 'var(--text)' : 'var(--text-muted)' }}>
                    {step.label}
                  </p>
                </div>
                {step.detail && (
                  <p className="text-[11px] leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>
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
        {isStatic ? 'Static flow (reduced motion)' : isInViewport && isDocVisible ? 'Looping · pauses offscreen' : 'Paused offscreen'}
      </p>
    </div>
  );
}
