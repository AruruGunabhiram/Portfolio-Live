import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePageLoadingReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

/**
 * Manages global loading state with a minimum display threshold.
 * If content is ready before `minDisplayMs`, the loader won't flash
 * (it only appears if loading takes longer than `delayMs`).
 */
export function usePageLoading(
  delayMs = 120,
  minDisplayMs = 400,
): UsePageLoadingReturn {
  const [visible, setVisible] = useState(false);
  const loadingRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    if (loading === loadingRef.current) return;
    loadingRef.current = loading;

    if (loading) {
      // Only show loader if loading takes longer than delayMs
      showTimerRef.current = setTimeout(() => {
        if (loadingRef.current) {
          setVisible(true);
          shownAtRef.current = Date.now();
        }
      }, delayMs);
    } else {
      // Clear pending show timer
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (!shownAtRef.current) {
        // Never shown; nothing to hide
        setVisible(false);
        return;
      }

      // Ensure loader stays visible for at least minDisplayMs
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = minDisplayMs - elapsed;
      if (remaining > 0) {
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          shownAtRef.current = null;
        }, remaining);
      } else {
        setVisible(false);
        shownAtRef.current = null;
      }
    }
  }, [delayMs, minDisplayMs]);

  return { isLoading: visible, setLoading };
}
