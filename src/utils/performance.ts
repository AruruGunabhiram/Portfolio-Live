import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect if component is in viewport using Intersection Observer
 * Returns true when element enters viewport
 */
export const useInViewport = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          // Optionally disconnect after first intersection
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInViewport };
};

/**
 * Hook for lazy loading heavy components only when needed
 */
export const useLazyLoad = <T,>(
  loader: () => Promise<{ default: T }>,
  shouldLoad: boolean
) => {
  const [component, setComponent] = useState<T | null>(null);

  useEffect(() => {
    if (shouldLoad && !component) {
      loader().then((module) => setComponent(module.default));
    }
  }, [shouldLoad, component, loader]);

  return component;
};

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
