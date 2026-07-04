import { create } from 'zustand';

interface SearchModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** Open/close state of the global Ctrl-K / Cmd-K command palette. */
export const useSearchModalStore = create<SearchModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
