import type { Item } from "@/types/item";
import { CheckCheck, ExternalLink, Loader, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import generalAreaHintsData from "@/data/general-area-hints.json";
import type { GeneralAreaHints } from "@/types/general-area-hints";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { useCompletedItemsStore } from "@/lib/hooks/useCompletedItemsStore";
import React, { useTransition } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const generalAreaHints = generalAreaHintsData as GeneralAreaHints;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

export function GeneralAreasComponent({
  generalArea,
  items,
  showAllItems = false,
}: {
  generalArea: string;
  items: Item[];
  showAllItems?: boolean;
}) {
  const completedItems = useCompletedItemsStore(
    (state) => state.completedItems
  );

  const activeItems = React.useMemo(
    () => items.filter((item) => !completedItems.includes(item.id)),
    [items, completedItems]
  );

  if (activeItems.length === 0 && !showAllItems) {
    return null; // Don't render anything if there are no active items
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{generalArea}</h2>
        {generalAreaHints[generalArea] && (
          <p className="text-muted-foreground text-sm">
            {generalAreaHints[generalArea]}
          </p>
        )}
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {!showAllItems &&
            activeItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                exit="exit"
                layout
              >
                <ItemComponent item={item} />
              </motion.div>
            ))}
          {showAllItems &&
            items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} layout>
                <ItemComponent
                  item={item}
                  isCompleted={completedItems.includes(item.id)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ItemComponent({
  item,
  isCompleted = false,
}: {
  item: Item;
  isCompleted?: boolean;
}) {
  const addCompletedItem = useCompletedItemsStore(
    (state) => state.addCompletedItem
  );
  const removeCompletedItem = useCompletedItemsStore(
    (state) => state.removeCompletedItem
  );

  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(() => {
      addCompletedItem(item.id);
    });
  };

  const handleUndo = () => {
    startTransition(() => {
      removeCompletedItem(item.id);
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle
            className={cn(isCompleted && "line-through text-muted-foreground")}
          >
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger>{item.name}</HoverCardTrigger>
              <HoverCardContent>
                <ul className="pl-4 list-disc text-xs">
                  {item.effect.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <a
            href={`https://bg3.wiki/wiki/${encodeURI(
              item.name.replace(/ /g, "_")
            ).replace(/'/g, "%27")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
        <CardDescription
          className={cn(isCompleted && "line-through text-muted-foreground")}
        >
          {item.type}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="icon"
            onClick={isCompleted ? handleUndo : handleComplete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="animate-spin" />
            ) : isCompleted ? (
              <Undo2 />
            ) : (
              <CheckCheck />
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className={cn(isCompleted && "line-through text-muted-foreground")}>
          {item.source}
        </p>
      </CardContent>
      <CardFooter>
        <p
          className={cn(
            "text-muted-foreground",
            isCompleted && "line-through "
          )}
        >
          {item.location}
        </p>
      </CardFooter>
    </Card>
  );
}
