import { useState, useEffect, useRef } from 'react';

/**
 * useLazySection
 *
 * Returns a ref to attach to a container element and a boolean indicating
 * whether the element has entered (or is about to enter) the viewport.
 * Once triggered, stays true permanently — sections don't unload.
 *
 * Uses IntersectionObserver with a configurable rootMargin to pre-load
 * slightly before the section scrolls into view.
 *
 * `force` bypasses the observer entirely (used for hash deep-links and TOC
 * jumps, where every section must be mounted so anchors exist and offsets
 * are final). Once forced, the section stays mounted like a normal trigger.
 */
export function useLazySection(
  rootMargin = '200px',
  force = false,
): {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(force);

  // A `force` that turns on after mount must also reveal the section.
  useEffect(() => {
    if (force) setIsVisible(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, [force]);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return { ref, isVisible };
}
