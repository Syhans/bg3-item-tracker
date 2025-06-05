import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HiddenItemsState {
  hiddenItems: number[];
  addHiddenItem: (itemId: number) => void;
  removeHiddenItem: (itemId: number) => void;
  isItemHidden: (itemId: number) => boolean;
}

export const useHiddenItemsStore = create<HiddenItemsState>()(
  persist(
    (set, get) => ({
      hiddenItems: [],
      addHiddenItem: (itemId) => {
        set((state) => ({
          hiddenItems: [...state.hiddenItems, itemId],
        }));
      },
      removeHiddenItem: (itemId) => {
        set((state) => ({
          hiddenItems: state.hiddenItems.filter((id) => id !== itemId),
        }));
      },
      isItemHidden: (itemId) => get().hiddenItems.includes(itemId),
    }),
    {
      name: "hidden-items-storage",
    }
  )
);
