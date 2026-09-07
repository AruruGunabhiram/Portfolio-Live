import { useState, useEffect, useRef } from 'react';

const SESSION_KEY = 'portfolio-loader-seen';
const HARD_TIMEOUT_MS = 1400;
const MIN_VISIBLE_MS = 180;
const SHOW_DELAY_MS = 120;

/**
 * Readiness-aware loader.
 * - First visit in session: waits for fonts.ready + rAF + small layout settle, but shows only if readiness > SHOW_DELAY_MS.
 * - Repeat visit (sessionStorage seen): skips loader entirely.
 * - Hard timeout at ~1400ms guarantees release even if fonts never resolve.
 * - Reduced motion: caller should render reduced variant; this hook only controls timing.
 */
export function useSessionLoader() {
  const [isLoading, setIsLoading] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) {
        return false;
      }
    } catch { /* ignore */ }
    return false; // start hidden; we show after SHOW_DELAY_MS only if not ready
  });

  const [shouldRender, setShouldRender] = useState(isLoading);
  const shownAtRef = useRef<number | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    // Repeat session: nothing to do
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        return;
      }
    } catch { /* ignore */ }

    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hardTimer: ReturnType<typeof setTimeout> | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      readyRef.current = true;
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }

      if (shownAtRef.current === null) {
        // Never shown → nothing to hide, clear pending show
        if (showTimer) clearTimeout(showTimer);
        setIsLoading(false);
        setShouldRender(false);
        return;
      }
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = MIN_VISIBLE_MS - elapsed;
      if (remaining > 0) {
        setTimeout(() => {
          setIsLoading(false);
          // allow exit animation
          setTimeout(() => setShouldRender(false), 220);
        }, remaining);
      } else {
        setIsLoading(false);
        setTimeout(() => setShouldRender(false), 220);
      }
    };

    // Decide to show only if readiness hasn't happened within SHOW_DELAY_MS
    showTimer = setTimeout(() => {
      if (!readyRef.current && !finished) {
        shownAtRef.current = Date.now();
        setShouldRender(true);
        setIsLoading(true);
      }
    }, SHOW_DELAY_MS);

    // Hard timeout
    hardTimer = setTimeout(finish, HARD_TIMEOUT_MS);

    // Critical readiness: fonts + two rAFs (layout + paint opportunity)
    const fontsReady: Promise<void> = (() => {
      try {
        // @ts-ignore document.fonts may be undefined in some envs
        if (document.fonts && document.fonts.ready) return document.fonts.ready.then(() => {});
      } catch { /* ignore */ }
      return Promise.resolve();
    })();

    fontsReady.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          finish();
        });
      });
    });

    // Also finish on load event if earlier (images/fonts)
    const onLoad = () => finish();
    window.addEventListener('load', onLoad, { once: true });

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hardTimer) clearTimeout(hardTimer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return { isLoading, shouldRender };
}
