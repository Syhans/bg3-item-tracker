import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemWithAct } from "@/types/item-with-act";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TableType,
} from "@tanstack/react-table";
import { useCompletedItemsStore } from "@/stores/completed-items-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Sparkles,
  Undo2,
} from "lucide-react";
import { useMemo } from "react";
import { useHiddenItemsStore } from "@/stores/hidden-items-store";
import { Tooltip } from "@/components/tooltip";

import bg3BuildsEquipmentData from "@/data/bg3-builds-equipment.min.json";
import { type Bg3BuildsEquipment } from "@/types/bg3-builds-equipment";
import { useBuildsStore } from "@/stores/builds-store";

const bg3BuildsEquipment: Bg3BuildsEquipment = bg3BuildsEquipmentData;

const columns: ColumnDef<ItemWithAct>[] = [
  {
    accessorKey: "act",
    header: "Act",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger>
          <span className="font-bold">{row.original.name}</span>
        </HoverCardTrigger>
        <HoverCardContent>
          <ul className="list-disc pl-4">
            {row.original.effect.map((e, idx) => (
              <li key={idx} className="text-xs">
                {e}
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    id: "partOfBuild",
    accessorFn: (row) => {
      const buildNames = Object.keys(bg3BuildsEquipment.itemsByBuild);
      const partOfBuild = buildNames.filter((buildName) =>
        bg3BuildsEquipment.itemsByBuild[buildName].includes(row.name)
      );
      return partOfBuild.length > 0 ? partOfBuild.join(", ") : "No builds";
    },
    header: undefined, // No header for this column;
    cell: ({ getValue }) => {
      const partOfBuild = getValue<string>();
      if (partOfBuild === "No builds") {
        return null;
      }
      return (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger>
            <Sparkles className="text-muted-foreground hover:text-primary" />
          </HoverCardTrigger>
          <HoverCardContent className="text-xs">
            <ul className="list-disc pl-4">
              {partOfBuild.split(", ").map((build, idx) => (
                <li key={idx}>{build}</li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "generalArea",
    header: "General Area",
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ getValue }) => {
      const MAX_CHARS = 50;
      const source = getValue<string>();
      if (source.length < MAX_CHARS) {
        return <p>{source}</p>;
      }
      return (
        <Tooltip content={source}>
          <p>{source.slice(0, MAX_CHARS)}…</p>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "actions",
    cell: ({ row }) => <ItemToggles itemId={row.original.id} />,
  },
];

function ItemToggles({ itemId }: { itemId: number }) {
  const isItemCompleted = useCompletedItemsStore((state) =>
    state.isItemCompleted(itemId)
  );
  const addCompletedItem = useCompletedItemsStore(
    (state) => state.addCompletedItem
  );
  const removeCompletedItem = useCompletedItemsStore(
    (state) => state.removeCompletedItem
  );

  const isItemHidden = useHiddenItemsStore((state) =>
    state.isItemHidden(itemId)
  );
  const addHiddenItem = useHiddenItemsStore((state) => state.addHiddenItem);
  const removeHiddenItem = useHiddenItemsStore(
    (state) => state.removeHiddenItem
  );

  const handleCompleteToggle = () => {
    if (isItemCompleted) {
      removeCompletedItem(itemId);
    } else {
      addCompletedItem(itemId);
    }
  };
  const handleHideToggle = () => {
    if (isItemHidden) {
      removeHiddenItem(itemId);
    } else {
      addHiddenItem(itemId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isItemHidden ? "default" : "outline"}
        size="icon"
        onClick={handleHideToggle}
      >
        {isItemHidden ? <EyeOff /> : <Eye />}
      </Button>
      <Button
        variant={isItemCompleted ? "default" : "outline"}
        size="icon"
        onClick={handleCompleteToggle}
      >
        {isItemCompleted ? <Undo2 /> : <CheckCheck />}
      </Button>
    </div>
  );
}

export function ItemsTable({
  items = [],
  showCompletedItems = false,
  showHiddenItems = false,
  showPartOfBuildOnly = false,
}: {
  items: ItemWithAct[];
  showCompletedItems?: boolean | "indeterminate";
  showHiddenItems?: boolean | "indeterminate";
  showPartOfBuildOnly?: boolean | "indeterminate";
}) {
  const completedItems = useCompletedItemsStore(
    (state) => state.completedItems
  );
  const hiddenItems = useHiddenItemsStore((state) => state.hiddenItems);
  const builds = useBuildsStore((state) => state.activeBuilds);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isCompleted = completedItems.includes(item.id);
      const isHidden = hiddenItems.includes(item.id);
      const buildsWithItem = bg3BuildsEquipment.buildsByItem[item.name] ?? [];
      if (!showCompletedItems && isCompleted) {
        return false;
      }
      if (!showHiddenItems && isHidden) {
        return false;
      }
      if (showPartOfBuildOnly && builds.length > 0) {
        const isPartOfBuild = builds.some((build) =>
          buildsWithItem.includes(build)
        );
        if (!isPartOfBuild) {
          return false;
        }
      }
      return true;
    });
  }, [
    completedItems,
    hiddenItems,
    items,
    showCompletedItems,
    showHiddenItems,
    builds,
    showPartOfBuildOnly,
  ]);

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        onChange={(e) => {
          table.setGlobalFilter(String(e.target.value));
        }}
        placeholder="Search items..."
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        (completedItems.includes(row.original.id) ||
                          hiddenItems.includes(row.original.id)) &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
}

function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end px-2">
      {/* <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 15, 20, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => {
              table.setPageIndex(0);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
