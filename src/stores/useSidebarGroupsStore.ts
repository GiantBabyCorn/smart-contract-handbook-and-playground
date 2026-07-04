import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarGroupsStore {
  /** Categories the user has collapsed. Absent = open, so new categories
   *  (and first visits) default to fully expanded. */
  closedCategories: string[];
  toggleCategory: (category: string) => void;
  isOpen: (category: string) => boolean;
}

/** Collapsed/expanded state of sidebar category groups, persisted across visits. */
export const useSidebarGroupsStore = create<SidebarGroupsStore>()(
  persist(
    (set, get) => ({
      closedCategories: [],
      toggleCategory: (category) =>
        set((s) => ({
          closedCategories: s.closedCategories.includes(category)
            ? s.closedCategories.filter((c) => c !== category)
            : [...s.closedCategories, category],
        })),
      isOpen: (category) => !get().closedCategories.includes(category),
    }),
    { name: 'sch-sidebar-groups' },
  ),
);
