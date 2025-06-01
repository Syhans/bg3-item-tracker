import type { Item } from "@/types/item";
import { GeneralAreasComponent } from "./GeneralAreasComponent";
import { useState } from "react";
import { Button } from "./ui/button";
import { Eye, EyeClosed } from "lucide-react";

export function ActComponent({ items, act }: { items: Item[]; act: string }) {
  const generalAreas = items.reduce<string[]>((acc, item) => {
    if (!acc.includes(item.generalArea)) {
      acc.push(item.generalArea);
    }
    return acc;
  }, []);

  const groupedByGeneralArea: Record<string, Item[]> = items.reduce<
    Record<string, Item[]>
  >((acc, item) => {
    acc[item.generalArea] ??= [];
    acc[item.generalArea].push(item);
    return acc;
  }, {});

  const [showAll, setShowAll] = useState(false);
  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className="grid grid-cols-1">
      <div className="flex w-full justify-between items-center mb-6">
        <h1 className="text-3xl font-bold ">Act {act} Items</h1>
        <Button onClick={toggleShowAll}>
          {showAll ? (
            <>
              <EyeClosed />
              Hide Completed
            </>
          ) : (
            <>
              <Eye />
              Show All Items
            </>
          )}
        </Button>
      </div>
      {generalAreas.map((generalArea) => (
        <GeneralAreasComponent
          key={generalArea}
          generalArea={generalArea}
          items={groupedByGeneralArea[generalArea]}
          showAllItems={showAll}
        />
      ))}
    </div>
  );
}
