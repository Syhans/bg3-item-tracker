"use client";

import { useBuildsStore } from "@/stores/builds-store";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { buttonVariants } from "./ui/button";

import bg3BuildsEquipmentData from "@/data/bg3-builds-equipment.min.json";
import { type Bg3BuildsEquipment } from "@/types/bg3-builds-equipment";

const bg3BuildsEquipment: Bg3BuildsEquipment = bg3BuildsEquipmentData;

const builds = Object.keys(bg3BuildsEquipment.itemsByBuild);

export function BuildsSelect() {
  const activeBuilds = useBuildsStore((state) => state.activeBuilds);
  const isBuildActive = useBuildsStore((state) => state.isBuildActive);
  const toggleBuild = useBuildsStore((state) => state.toggleBuild);
  const enableAllBuilds = useBuildsStore((state) => state.enableAllBuilds);
  const disableAllBuilds = useBuildsStore((state) => state.disableAllBuilds);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline" })}>
        Builds ({activeBuilds.length})
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            enableAllBuilds();
          }}
        >
          Enable All Builds
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            disableAllBuilds();
          }}
        >
          Disable All Builds
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {builds.map((build) => (
          <DropdownMenuCheckboxItem
            key={build}
            checked={isBuildActive(build)}
            onCheckedChange={() => {
              toggleBuild(build);
            }}
            onSelect={(e) => {
              e.preventDefault();
            }} // Prevents the menu from closing on click
          >
            {build}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
