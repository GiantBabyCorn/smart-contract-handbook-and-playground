import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'dark' | 'light';

interface ThemeStore {
  /** The currently active theme. Defaults to 'dark'. */
  theme: Theme;
  /** Toggle between dark and light. */
  toggle: () => void;
  /** Explicitly set a theme. */
  set: (theme: Theme) => void;
}

// ---------------------------------------------------------------------------
// Store
//
// Intentionally pure state — no DOM side-effects here.
// DOM attribute synchronisation is handled by the useThemeSync hook so that
// the store remains fully testable without a browser environment.
// ---------------------------------------------------------------------------

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      toggle: () =>
        set((s) => ({
          theme: s.theme === 'dark' ? 'light' : 'dark',
        })),

      set: (theme) => set({ theme }),
    }),
    {
      name: 'erc-explorer-theme',
      // Only persist the theme value, not the action callbacks.
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
