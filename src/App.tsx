import act1ItemsData from "@/data/act1.min.json";
import type { Item } from "@/types/item";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

const act1Items: Item[] = act1ItemsData as Item[];
const generalAreas = act1Items.reduce<string[]>((acc, item) => {
  if (!acc.includes(item.generalArea)) {
    acc.push(item.generalArea);
  }
  return acc;
}, []);

const act1ItemsGroupedByGeneralArea: Record<string, Item[]> = act1Items.reduce<
  Record<string, Item[]>
>((acc, item) => {
  acc[item.generalArea] ??= [];
  acc[item.generalArea].push(item);
  return acc;
}, {});

function App() {
  return (
    <main className="container mx-auto py-8">
      {generalAreas.map((generalArea) => (
        <GeneralAresComponent
          key={generalArea}
          generalArea={generalArea}
          items={act1ItemsGroupedByGeneralArea[generalArea]}
        />
      ))}
    </main>
  );
}

function GeneralAresComponent({
  generalArea,
  items,
}: {
  generalArea: string;
  items: Item[];
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{generalArea}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.type}</CardDescription>
              <CardAction>
                <Button variant="outline" size="icon">
                  <CheckCheck />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>{item.source}</p>
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground">{item.location}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default App;
