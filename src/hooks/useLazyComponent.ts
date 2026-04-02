import { useState, useEffect, useRef } from 'react';

export interface UseLazyComponentResult<T> {
  /** The resolved value returned by `loader`, or null while pending. */
  component: T | null;
  /** Any error thrown by `loader`, or null on success / while pending. */
  error: Error | null;
  /** True until `loader` either resolves or rejects. */
  isLoading: boolean;
}

/**
 * useLazyComponent
 *
 * Calls `loader` once on mount and tracks the resulting Promise lifecycle.
 * Designed for dynamic import() calls that return a module namespace object
 * (e.g. `() => import('./HeavyChart')`), but works with any async factory.
 *
 * Usage:
 * ```tsx
 * const { component: mod, isLoading } = useLazyComponent(
 *   () => import('@/components/charts/CandlestickChart'),
 * );
 * const CandlestickChart = mod?.default ?? null;
 * ```
 *
 * The `loader` reference is captured once on mount.  If the loader identity
 * changes between renders the new loader is NOT automatically invoked — this
 * is intentional to avoid accidental re-fetches from inline arrow functions.
 * Wrap the loader in `useCallback` or define it at module scope to control
 * when a re-load should occur.
 *
 * A stale-closure guard prevents state updates after unmount.
 */
export function useLazyComponent<T>(
  loader: () => Promise<T>,
): UseLazyComponentResult<T> {
  const [component, setComponent] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Capture the loader on first render only — see JSDoc above.
  const loaderRef = useRef(loader);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError(null);

    loaderRef.current()
      .then((result) => {
        if (!cancelled) {
          setComponent(result);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { component, error, isLoading };
}
