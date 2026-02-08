import type { AttendanceLocation } from "@repo/db";
import type { TimeZone } from "@repo/db/timezone";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableMemberInfo from "../common/DataTableMemberInfo.svelte";
import DataTableCheckInCheckOut from "./DataTableCheckInCheckOut.svelte";
import DataTableStatus from "./DataTableStatus.svelte";
import DataTableTimezone from "./DataTableTimezone.svelte";

export type AttendanceItem = {
  id: string;
  date: string;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInLocation: AttendanceLocation | null;
  checkOutLocation: AttendanceLocation | null;
  workedSeconds: number | null;
  status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE";
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  policy: {
    id: string;
    name: string;
    timezone: TimeZone;
    clockInSec: number;
    clockOutSec: number;
  };
};

export const columns: ColumnDef<AttendanceItem>[] = [
  {
    accessorKey: "user",
    header: "Member",
    cell: ({ row }) => {
      const item = row.original as AttendanceItem;
      return renderComponent(DataTableMemberInfo, {
        name: item.user.name,
        email: item.user.email,
        avatar: item.user.image,
      });
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const item = row.original as AttendanceItem;
      return formatDate(new Date(item.date));
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
    header: "Attendance Timezone",
    cell: ({ row }) => renderComponent(DataTableTimezone, row.original.policy),
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
