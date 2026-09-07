import { useEffect, useState, useId, useCallback } from 'react';
import { usePortfolioMode } from '../context/PortfolioModeContext';

// ─── Shared reduced-motion (singleton listener, avoids per-story duplication) ──
let reducedMotionValue = false;
let reducedInitialized = false;
const reducedSubs = new Set<(v: boolean) => void>();
let reducedMQL: MediaQueryList | null = null;

function ensureReducedListener() {
  if (reducedInitialized || typeof window === 'undefined') return;
  reducedMQL = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionValue = reducedMQL.matches;
  const handler = (e: MediaQueryListEvent) => {
    reducedMotionValue = e.matches;
    reducedSubs.forEach(fn => fn(e.matches));
  };
  reducedMQL.addEventListener('change', handler);
  reducedInitialized = true;
}

export function useReducedMotion(): boolean {
  ensureReducedListener();
  const [reduced, setReduced] = useState(() => reducedMotionValue);
  useEffect(() => {
    ensureReducedListener();
    setReduced(reducedMotionValue);
    const fn = (v: boolean) => setReduced(v);
    reducedSubs.add(fn);
    return () => { reducedSubs.delete(fn); };
  }, []);
  return reduced;
}

// ─── Shared document visibility (singleton) ─────────────────────────────────
let docVisibleValue = true;
let docVisibleInitialized = false;
const docVisibleSubs = new Set<(v: boolean) => void>();

function ensureDocVisibleListener() {
  if (docVisibleInitialized || typeof document === 'undefined') return;
  docVisibleValue = document.visibilityState === 'visible';
  const handler = () => {
    docVisibleValue = document.visibilityState === 'visible';
    docVisibleSubs.forEach(fn => fn(docVisibleValue));
  };
  document.addEventListener('visibilitychange', handler);
  docVisibleInitialized = true;
}

export function useDocumentVisible(): boolean {
  ensureDocVisibleListener();
  const [visible, setVisible] = useState(() => docVisibleValue);
  useEffect(() => {
    ensureDocVisibleListener();
    setVisible(docVisibleValue);
    const fn = (v: boolean) => setVisible(v);
    docVisibleSubs.add(fn);
    return () => { docVisibleSubs.delete(fn); };
  }, []);
  return visible;
}

// ─── Compact / mobile story capability ─────────────────────────────────────
export function useIsCompactStory(breakpoint = 768): boolean {
  const getCompact = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const narrow = window.innerWidth < breakpoint;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    return narrow || coarse;
  }, [breakpoint]);

  const [compact, setCompact] = useState<boolean>(() => getCompact());

  useEffect(() => {
    const onResize = () => setCompact(getCompact());
    const mql = window.matchMedia('(pointer: coarse)');
    const onPointerChange = () => setCompact(getCompact());
    window.addEventListener('resize', onResize);
    mql.addEventListener('change', onPointerChange);
    return () => {
      window.removeEventListener('resize', onResize);
      mql.removeEventListener('change', onPointerChange);
    };
  }, [getCompact]);

  return compact;
}

// ─── Competitive one-active visibility coordination (FlowDemo heritage) ───────
// Exactly one eligible story animates — shared observer picks most-visible.
type CompetitiveEntry = { ratio: number; setActive: (v: boolean) => void };
const competitiveRegistry = new Map<string, CompetitiveEntry>();
let competitiveObserver: IntersectionObserver | null = null;

function getCompetitiveObserver() {
  if (competitiveObserver) return competitiveObserver;
  competitiveObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        const id = (e.target as HTMLElement).dataset.storyId;
        if (!id) return;
        const ent = competitiveRegistry.get(id);
        if (ent) ent.ratio = e.intersectionRatio;
      });
      let bestId: string | null = null;
      let bestRatio = 0.2;
      competitiveRegistry.forEach((ent, id) => {
        if (ent.ratio >= bestRatio) {
          bestRatio = ent.ratio;
          bestId = id;
        }
      });
      competitiveRegistry.forEach((ent, id) => ent.setActive(id === bestId));
    },
    { threshold: [0, 0.2, 0.5, 0.75] }
  );
  return competitiveObserver;
}

// ─── Simple visibility (non-competitive) ───────────────────────────────────
export function useStoryVisibility(
  ref: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        const e = entries[0];
        if (e) setVisible(e.isIntersecting && e.intersectionRatio >= (options?.threshold as number ?? 0.2));
      },
      { threshold: 0.2, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);
  return visible;
}

export function useCompetitiveStoryActive(
  ref: React.RefObject<HTMLElement | null>
): boolean {
  const sid = useId();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.storyId = sid;
    const entry: CompetitiveEntry = { ratio: 0, setActive };
    competitiveRegistry.set(sid, entry);
    const obs = getCompetitiveObserver();
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      competitiveRegistry.delete(sid);
      // re-evaluate remaining
      let bestId: string | null = null;
      let bestRatio = 0.2;
      competitiveRegistry.forEach((ent, id) => {
        if (ent.ratio >= bestRatio) {
          bestRatio = ent.ratio;
          bestId = id;
        }
      });
      competitiveRegistry.forEach((ent, id) => ent.setActive(id === bestId));
    };
  }, [ref, sid]);

  return active;
}

// ─── Combined lifecycle — the canonical shouldAnimate rule ──────────────────
export interface StoryLifecycle {
  isVisible: boolean;
  isActive: boolean;
  isReducedMotion: boolean;
  isRecruiter: boolean;
  isDocumentVisible: boolean;
  isCompact: boolean;
  shouldAnimate: boolean;
}

export function useStoryLifecycle(
  ref: React.RefObject<HTMLElement | null>,
  opts?: { competitive?: boolean }
): StoryLifecycle {
  const competitive = opts?.competitive ?? false;
  const isReduced = useReducedMotion();
  const isDocumentVisible = useDocumentVisible();
  const isCompact = useIsCompactStory();
  const { isRecruiter } = usePortfolioMode();

  // competitive uses exclusive most-visible, non-competitive uses simple visible
  const isCompetitiveActive = useCompetitiveStoryActive(competitive ? ref : ({ current: null } as React.RefObject<HTMLElement | null>));
  const isSimpleVisible = useStoryVisibility(competitive ? ({ current: null } as React.RefObject<HTMLElement | null>) : ref);

  // For competitive, visible === active; for simple, active === visible
  const isActive = competitive ? isCompetitiveActive : isSimpleVisible;
  const isVisible = isActive;

  const shouldAnimate = isVisible && isActive && isDocumentVisible && !isReduced && !isRecruiter;

  return {
    isVisible,
    isActive,
    isReducedMotion: isReduced,
    isRecruiter,
    isDocumentVisible,
    isCompact,
    shouldAnimate,
  };
}

// Test-only helpers to reset singletons between tests
export function __resetStoryLifecycleForTests() {
  competitiveRegistry.clear();
  if (competitiveObserver) {
    competitiveObserver.disconnect();
    competitiveObserver = null;
  }
  reducedSubs.clear();
  reducedInitialized = false;
  reducedMotionValue = false;
  reducedMQL = null;
  docVisibleSubs.clear();
  docVisibleInitialized = false;
  docVisibleValue = true;
}
