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
 */
export function useLazySection(rootMargin = '200px'): {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
