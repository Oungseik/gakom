import type { Day } from "@repo/db";
import type { TimeZone } from "@repo/db/timezone";
import { Checkbox } from "@repo/ui/checkbox";
import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import DataTableMemberInfo from "../common/DataTableMemberInfo.svelte";
import DataTableActions from "./DataTableActions.svelte";
import DataTableAddress from "./DataTableAddress.svelte";
import DataTableAttendancePolicy from "./DataTableAttendancePolicy.svelte";
import DataTableMembershipPeriod from "./DataTableMembershipPeriod.svelte";
import DataTablePosition from "./DataTablePosition.svelte";
import DataTableUserId from "./DataTableUserId.svelte";

export type Member = {
  organizationId: string;
  slug: string;
  userId: string;
  memberId: string;
  name: string;
  email: string;
  image?: string | null;
  role: "OWNER" | "MEMBER" | "ADMIN";
  address?: string | null;
  city?: string | null;
  countryCode?: string | null;
  position?: string | null;
  joinedAt: Date;
  leftAt?: Date | null;
  attendancePolicy?: {
    id: string;
    name: string;
    timezone: TimeZone;
    clockInSec: number;
    clockOutSec: number;
    workdays: Day[];
  } | null;
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
    header: "Personal Info",
    cell: ({ row }) =>
      renderComponent(DataTableMemberInfo, {
        name: row.original.name,
        email: row.original.email,
        image: row.original.image,
      }),
  },
  {
    id: "address",
    header: "Address",
    cell: ({ row }) =>
      renderComponent(DataTableAddress, {
        address: row.original.address,
        city: row.original.city,
        countryCode: row.original.countryCode,
      }),
  },
  {
    id: "position",
    header: "Position & Role",
    cell: ({ row }) =>
      renderComponent(DataTablePosition, {
        position: row.original.position,
        role: row.original.role,
      }),
  },
  {
    id: "attendancePolicy",
    header: "Attendance Policy",
    cell: ({ row }) =>
      renderComponent(DataTableAttendancePolicy, {
        policy: row.original.attendancePolicy,
      }),
  },
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
      return renderComponent(DataTableActions, {
        userId: row.original.userId,
        memberId: row.original.memberId,
        organizationId: row.original.organizationId,
        email: row.original.email,
        name: row.original.name,
        slug: row.original.slug,
        role: row.original.role,
        position: row.original.position,
        attendancePolicyId: row.original.attendancePolicy?.id,
      });
    },
  },
];
