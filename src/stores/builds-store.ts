import { create } from "zustand";
import { persist } from "zustand/middleware";

import bg3BuildsEquipmentData from "@/data/bg3-builds-equipment.min.json";
import { type Bg3BuildsEquipment } from "@/types/bg3-builds-equipment";

const bg3BuildsEquipment: Bg3BuildsEquipment = bg3BuildsEquipmentData;

const defaultBuilds = Object.keys(bg3BuildsEquipment.itemsByBuild);

interface BuildsState {
  activeBuilds: string[];
  isBuildActive: (buildName: string) => boolean;
  toggleBuild: (buildName: string) => void;
  enableAllBuilds: () => void;
  disableAllBuilds: () => void;
}

export const useBuildsStore = create<BuildsState>()(
  persist(
    (set, get) => ({
      activeBuilds: defaultBuilds,
      isBuildActive: (buildName: string) => {
        return get().activeBuilds.includes(buildName);
      },
      toggleBuild: (buildName) => {
        set((state) => {
          const isActive = state.activeBuilds.includes(buildName);
          return {
            activeBuilds: isActive
              ? state.activeBuilds.filter((id) => id !== buildName)
              : [...state.activeBuilds, buildName],
          };
        });
      },
      enableAllBuilds: () => {
        set({ activeBuilds: defaultBuilds });
      },
      disableAllBuilds: () => {
        set({ activeBuilds: [] });
      },
    }),
    {
      name: "builds-storage",
    }
  )
);
