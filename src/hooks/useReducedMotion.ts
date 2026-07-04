import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(QUERY).matches
  );
}

/**
 * Returns `true` when the user has requested reduced motion via the OS
 * `prefers-reduced-motion: reduce` media query, and re-renders when the
 * preference changes.
 *
 * Implemented directly on `matchMedia` + `useSyncExternalStore` (instead of
 * delegating to Motion's `useReducedMotion`) so that non-Motion consumers —
 * the React Flow edge components, whose chunks do not otherwise include the
 * motion runtime — can use it without pulling `motion-vendor` into their
 * bundle. For `motion.*` components, `<MotionConfig reducedMotion="user">`
 * reads the same media query, so both mechanisms stay in sync.
 *
 * Usage:
 * ```ts
 * const reduceMotion = useReducedMotion();
 * const transition = reduceMotion ? { duration: 0 } : { duration: 0.3 };
 * ```
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
