import { useReducedMotion as useMotionReducedMotion } from 'motion/react';

/**
 * Returns `true` when the user has requested reduced motion via the OS
 * `prefers-reduced-motion: reduce` media query.
 *
 * Delegates to Motion's `useReducedMotion` hook and normalises the
 * nullable return value to a plain boolean so callers don't need to
 * handle `null` (which is returned server-side / before the media query
 * is evaluated).
 *
 * Usage:
 * ```ts
 * const reduceMotion = useReducedMotion();
 * const transition = reduceMotion ? { duration: 0 } : { duration: 0.3 };
 * ```
 */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}
