import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableStatus from "../common/DataTableStatus.svelte";
import DataTableDateAndDuration from "./DataTableDateAndDuration.svelte";

export type LeaveRequestStatus = "APPROVED" | "CANCELLED" | "PENDING" | "REJECTED";

export type LeaveRequest = {
  id: string;
  slug: string;
  status: LeaveRequestStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    accessorKey: "name",
    header: "Leave Type",
  },
  {
    id: "requestedAt",
    header: "Requested at",
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
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
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     return renderComponent(DataTableActions, {
  //       id: row.original.id,
  //       slug: row.original.slug,
  //     });
  //   },
  // },
];
