import { Checkbox } from "@repo/ui/checkbox";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableActions from "./DataTableActions.svelte";

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
};

export const columns: ColumnDef<CalendarEvent>[] = [
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
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return description || "—";
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {
        event: {
          id: row.original.id,
          calendarId: row.original.calendarId,
          title: row.original.title,
          description: row.original.description,
          date: row.original.date,
          createdAt: row.original.createdAt,
          updatedAt: row.original.updatedAt,
        },
        slug: row.original.slug,
      });
    },
  },
];
