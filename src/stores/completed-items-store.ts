import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompletedItemsState {
  completedItems: number[];
  addCompletedItem: (itemId: number) => void;
  removeCompletedItem: (itemId: number) => void;
  isItemCompleted: (itemId: number) => boolean;
}

export const useCompletedItemsStore = create<CompletedItemsState>()(
  persist(
    (set, get) => ({
      completedItems: [],
      addCompletedItem: (itemId) => {
        set((state) => ({
          completedItems: [...state.completedItems, itemId],
        }));
      },
      removeCompletedItem: (itemId) => {
        set((state) => ({
          completedItems: state.completedItems.filter((id) => id !== itemId),
        }));
      },
      isItemCompleted: (itemId) => get().completedItems.includes(itemId),
    }),
    {
      name: "completed-items-storage",
    }
  )
);
