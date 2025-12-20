import { Checkbox } from "@repo/ui/checkbox";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableActions from "./DataTableActions.svelte";
import DataTableMemberInfo from "./DataTableMemberInfo.svelte";
import DataTableMembershipPeriod from "./DataTableMembershipPeriod.svelte";
import DataTableUserId from "./DataTableUserId.svelte";

export type Member = {
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
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

  {
    accessorKey: "userId",
    header: "ID",
    cell: ({ row }) => renderComponent(DataTableUserId, { userId: row.original.userId }),
  },
  {
    id: "info",
    header: "Info",
    cell: ({ row }) =>
      renderComponent(DataTableMemberInfo, {
        name: row.original.name,
        email: row.original.email,
        image: row.original.image,
      }),
  },
  { accessorKey: "countryCode", header: "Location" },
  { accessorKey: "position", header: "Position" },
  {
    id: "membershipPeriod",
    header: "Membership Period",
    cell: ({ row }) =>
      renderComponent(DataTableMembershipPeriod, {
        joinedAt: row.original.joinedAt,
        leftAt: row.original.leftAt,
      }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: row.original.userId });
    },
  },
];
