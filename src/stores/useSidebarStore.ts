import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  isMobileNavOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  isMobileNavOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
