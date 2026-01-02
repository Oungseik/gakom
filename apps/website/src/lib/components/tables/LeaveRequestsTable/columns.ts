import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate, getDaysDifference } from "$lib/utils";
import DataTableMemberInfo from "../common/DataTableMemberInfo.svelte";
import DataTableStatus from "../common/DataTableStatus.svelte";

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
  createdAt: Date;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    id: "info",
    header: "Personal Info",
    cell: ({ row }) =>
      renderComponent(DataTableMemberInfo, {
        name: row.original.username,
        position: row.original.position,
        image: row.original.image,
      }),
  },
  { accessorKey: "name", header: "Leave Type" },
  {
    id: "dates",
    header: "Dates",
    cell: ({ row }) => {
      return row.original.startDate === row.original.endDate
        ? `${formatDate(row.original.startDate)}`
        : `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}`;
    },
  },
  {
    id: "durations",
    header: "Duration",
    cell: ({ row }) => {
      const days = getDaysDifference(row.original.endDate, row.original.startDate) + 1;
      return days === 1 ? `${days} day` : `${days} days`;
    },
  },
  {
    id: "requestedAt",
    header: "Requested at",
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return renderComponent(DataTableStatus, { status: row.original.status });
    },
  },
];
