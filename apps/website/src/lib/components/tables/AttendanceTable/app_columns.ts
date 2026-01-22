import type { AttendanceLocation } from "@repo/db";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableCheckInCheckOut from "./DataTableCheckInCheckOut.svelte";
import DataTableStatus from "./DataTableStatus.svelte";

export type AttendanceItem = {
  id: string;
  date: string;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInLocation: AttendanceLocation | null;
  checkOutLocation: AttendanceLocation | null;
  workedSeconds: number | null;
  status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE";
  policy: {
    timezone: string;
  };
};

export const columns: ColumnDef<AttendanceItem>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const item = row.original as AttendanceItem;
      return item.date;
    },
  },
  {
    header: "Check in - Check out",
    cell: ({ row }) => {
      return renderComponent(DataTableCheckInCheckOut, {
        attendanceTimezone: row.original.policy.timezone,
        checkInAt: row.original.checkInAt,
        checkOutAt: row.original.checkOutAt,
      });
    },
  },
  {
    accessorKey: "workedSeconds",
    header: "Work Hours",
    cell: ({ row }) => {
      const item = row.original as AttendanceItem;
      if (item.workedSeconds === null) return "-";
      const hours = Math.floor(item.workedSeconds / 3600);
      const minutes = Math.floor((item.workedSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const item = row.original as AttendanceItem;
      return renderComponent(DataTableStatus, { status: item.status });
    },
  },
];
