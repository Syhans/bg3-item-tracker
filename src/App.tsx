import act1ItemsData from "@/data/act1.min.json";
import act2ItemsData from "@/data/act2.min.json";
import act3ItemsData from "@/data/act3.min.json";
import { useCompletedItemsStore } from "./lib/hooks/useCompletedItemsStore";
import type { Item } from "@/types/item";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TableType,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Button } from "./components/ui/button";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeClosed,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "./lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./components/ui/hover-card";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

function App() {
  const [showAllItems, setShowAllItems] = useState(false);
  const toggleShowAllItems = () => {
    setShowAllItems((prev) => !prev);
  };

  return (
    <main className="container mx-auto py-8">
      <Tabs defaultValue="act1">
        <div className="flex items-center justify-between w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="act1">Act 1</TabsTrigger>
            <TabsTrigger value="act2">Act 2</TabsTrigger>
            <TabsTrigger value="act3">Act 3</TabsTrigger>
          </TabsList>
          <Button onClick={toggleShowAllItems} className="mb-4">
            {showAllItems ? (
              <>
                <EyeClosed />
                Hide Completed Items
              </>
            ) : (
              <>
                <Eye />
                Show All Items
              </>
            )}
          </Button>
        </div>
        <TabsContent value="act1">
          <ItemsTable
            items={act1ItemsData as Item[]}
            showAllItems={showAllItems}
          />
        </TabsContent>
        <TabsContent value="act2">
          <ItemsTable
            items={act2ItemsData as Item[]}
            showAllItems={showAllItems}
          />
        </TabsContent>
        <TabsContent value="act3">
          <ItemsTable
            items={act3ItemsData as Item[]}
            showAllItems={showAllItems}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

const columns: ColumnDef<Item>[] = [
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
    cell: ({ row }) => {
      return <p className="text-wrap">{row.original.source}</p>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "completed",
    cell: ({ row }) => <ItemCompletedToggle itemId={row.original.id} />,
  },
];

function ItemCompletedToggle({ itemId }: { itemId: number }) {
  const isItemCompleted = useCompletedItemsStore((state) =>
    state.isItemCompleted(itemId)
  );
  const addCompletedItem = useCompletedItemsStore(
    (state) => state.addCompletedItem
  );
  const removeCompletedItem = useCompletedItemsStore(
    (state) => state.removeCompletedItem
  );

  const handleClick = () => {
    if (isItemCompleted) {
      removeCompletedItem(itemId);
    } else {
      addCompletedItem(itemId);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick}>
      {isItemCompleted ? <Undo2 /> : <CheckCheck />}
    </Button>
  );
}

function ItemsTable({
  items = [],
  showAllItems = false,
}: {
  items: Item[];
  showAllItems?: boolean;
}) {
  const completedItems = useCompletedItemsStore(
    (state) => state.completedItems
  );
  const isItemCompleted = useCompletedItemsStore(
    (state) => state.isItemCompleted
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (showAllItems) return true;
      return !completedItems.includes(item.id);
    });
  }, [items, completedItems, showAllItems]);

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
                        isItemCompleted(row.original.id) &&
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

export default App;
