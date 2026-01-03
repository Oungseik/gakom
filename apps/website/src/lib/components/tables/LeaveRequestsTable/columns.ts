import { Checkbox } from "@repo/ui/checkbox";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableMemberInfo from "../common/DataTableMemberInfo.svelte";
import DataTableStatus from "../common/DataTableStatus.svelte";
import DataTableActions from "./DataTableActions.svelte";
import DataTableDateAndDuration from "./DataTableDateAndDuration.svelte";

export type LeaveRequest = {
  organizationId: string;
  slug: string;
  userId: string;
  username: string;
  position?: string | null;
  image?: string | null;
  name: string;
  status: "approved" | "cancelled" | "pending" | "rejected";
  startDate: Date;
  endDate: Date;
  reviewerName?: string | null;
  reviewerImage?: string | null;
  reviewerPosition?: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<LeaveRequest>[] = [
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
    id: "info",
    header: "Requester",
    cell: ({ row }) =>
      renderComponent(DataTableMemberInfo, {
        name: row.original.username,
        position: row.original.position,
        image: row.original.image,
        hideImage: true,
      }),
  },
  {
    id: "requestedAt",
    header: "Requested at",
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
  },
  {
    accessorKey: "name",
    header: "Leave Type",
  },
  {
    id: "dates",
    header: "Duration & Date",
    cell: ({ row }) => {
      return renderComponent(DataTableDateAndDuration, {
        startDate: row.original.startDate,
        endDate: row.original.endDate,
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return renderComponent(DataTableStatus, { status: row.original.status });
    },
  },
  {
    id: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      return (
        row.original.reviewerName &&
        row.original.reviewerPosition &&
        renderComponent(DataTableMemberInfo, {
          name: row.original.reviewerName,
          position: row.original.reviewerPosition,
          image: row.original.image,
          hideImage: true,
        })
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {});
    },
  },
];
