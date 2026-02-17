import type { Day } from "@repo/db";
import type { TIMEZONES } from "@repo/db/timezone";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableActions from "./DataTableActions.svelte";
import DataTableSchedule from "./DataTableSchedule.svelte";

export type AttendancePolicy = {
  id: string;
  name: string;
  timezone: (typeof TIMEZONES)[number];
  clockIn: number;
  clockOut: number;
  gracePeriod: number;
  workdays: Day[];
  updatedAt: Date;
  organizationId: string;
};

type ActionsColumnProps = {
  policy: AttendancePolicy;
  onEdit: (policy: AttendancePolicy) => void;
};

export const columns = (
  onEdit: (policy: AttendancePolicy) => void,
): ColumnDef<AttendancePolicy>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "timezone",
    header: "Timezone",
    cell: ({ row }) => row.original.timezone,
  },
  {
    id: "schedule",
    header: "Schedule",
    cell: ({ row }) =>
      renderComponent(DataTableSchedule, {
        clockIn: row.original.clockIn,
        clockOut: row.original.clockOut,
        workdays: row.original.workdays,
      }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const props: ActionsColumnProps = {
        policy: row.original,
        onEdit,
      };
      return renderComponent(DataTableActions, props);
    },
    enableSorting: false,
  },
];
