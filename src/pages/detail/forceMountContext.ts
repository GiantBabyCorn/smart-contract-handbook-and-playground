import { createContext } from 'react';

/** When true, every LazySection below the provider mounts immediately
 *  (bypassing the IntersectionObserver) so section anchors exist and offsets
 *  are final before scrolling to a hash target (deep links, TOC jumps). */
export const ForceMountContext = createContext(false);
