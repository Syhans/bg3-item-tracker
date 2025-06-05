import act1ItemsData from "@/data/act1.min.json";
import act2ItemsData from "@/data/act2.min.json";
import act3ItemsData from "@/data/act3.min.json";
import { useState } from "react";
import { ItemsTable } from "@/components/items-table";
import type { ItemWithAct } from "@/types/item-with-act";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const allItemsWithAct: ItemWithAct[] = [
  ...act1ItemsData.map((item) => ({ ...item, act: 1 })),
  ...act2ItemsData.map((item) => ({ ...item, act: 2 })),
  ...act3ItemsData.map((item) => ({ ...item, act: 3 })),
];

function App() {
  const [showCompletedItems, setShowCompletedItems] = useState<
    boolean | "indeterminate"
  >(false);
  const [showHiddenItems, setShowHiddenItems] = useState<
    boolean | "indeterminate"
  >(false);

  return (
    <main className="container mx-auto py-8 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-completed"
            checked={showCompletedItems}
            onCheckedChange={setShowCompletedItems}
          />
          <Label htmlFor="show-completed">Show completed items</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-hidden"
            checked={showHiddenItems}
            onCheckedChange={setShowHiddenItems}
          />
          <Label htmlFor="show-hidden">Show hidden items</Label>
        </div>
      </div>
      <ItemsTable
        items={allItemsWithAct}
        showCompletedItems={showCompletedItems}
        showHiddenItems={showHiddenItems}
      />
    </main>
  );
}
export default App;
