import { Checkbox } from "@repo/ui/checkbox";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableActions from "./DataTableActions.svelte";

export type Member = {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  countryCode?: string | null;
  position?: string | null;
  joinedAt: Date;
  leftAt?: Date | null;
};

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value: boolean) => table.toggleAllPageRowsSelected(value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean) => row.toggleSelected(value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },

  { accessorKey: "userId", header: "ID" },
  { accessorKey: "info", header: "Info" },
  { accessorKey: "countryCode", header: "Country" },
  { accessorKey: "position", header: "Position" },
  { accessorKey: "joinedAt", header: "Joined At" },
  // { accessorKey: "leftAt", header: "Left At" },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: row.original.userId });
    },
  },
];
