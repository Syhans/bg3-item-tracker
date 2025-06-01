import act1ItemsData from "@/data/act1.min.json";
import act2ItemsData from "@/data/act2.min.json";
import act3ItemsData from "@/data/act3.min.json";
import type { Item } from "@/types/item";
import { ActComponent } from "./components/ActComponent";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Button } from "./components/ui/button";
import { ArrowUpToLine } from "lucide-react";

function App() {
  return (
    <main className="container mx-auto py-8">
      <Tabs defaultValue="act1">
        <TabsList className="mb-6">
          <TabsTrigger value="act1">Act 1</TabsTrigger>
          <TabsTrigger value="act2">Act 2</TabsTrigger>
          <TabsTrigger value="act3">Act 3</TabsTrigger>
        </TabsList>
        <TabsContent value="act1">
          <ActComponent items={act1ItemsData as Item[]} act="1" />
        </TabsContent>
        <TabsContent value="act2">
          <ActComponent items={act2ItemsData as Item[]} act="2" />
        </TabsContent>
        <TabsContent value="act3">
          <ActComponent items={act3ItemsData as Item[]} act="3" />
        </TabsContent>
      </Tabs>
      <footer className="mt-8 flex justify-center">
        <Button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <ArrowUpToLine />
          Back to top
        </Button>
      </footer>
    </main>
  );
}

export default App;
