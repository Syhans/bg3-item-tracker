import { create } from "zustand";
import { persist } from "zustand/middleware";

import bg3BuildsEquipmentData from "@/data/bg3-builds-equipment.min.json";
import { type Bg3BuildsEquipment } from "@/types/bg3-builds-equipment";

const bg3BuildsEquipment: Bg3BuildsEquipment = bg3BuildsEquipmentData;

const defaultBuilds = Object.keys(bg3BuildsEquipment.itemsByBuild);

interface BuildsState {
  activeBuilds: string[];
  toggleBuild: (buildName: string) => void;
}

export const useBuildsStore = create<BuildsState>()(
  persist(
    (set) => ({
      activeBuilds: defaultBuilds,
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
    }),
    {
      name: "builds-storage",
    }
  )
);
