import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableStatus from "../common/DataTableStatus.svelte";
import DataTableActions from "./DataTableActions.svelte";
import DataTableRole from "./DataTableRole.svelte";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";

export type Invitation = {
  id: string;
  email: string;
  role: "MEMBER" | "ADMIN" | "OWNER";
  position: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  organizationId: string;
  slug: string;
  attendancePolicyId?: string;
};

export const columns: ColumnDef<Invitation>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return renderComponent(DataTableStatus, { status: row.original.status });
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return renderComponent(DataTableRole, { role: row.original.role });
    },
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "createdAt",
    header: "Invited at",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires at",
    cell: ({ row }) => formatDate(row.original.expiresAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {
        invitationId: row.original.id,
        organizationId: row.original.organizationId,
        slug: row.original.slug,
        role: row.original.role,
        position: row.original.position,
        email: row.original.email,
        status: row.original.status,
        attendancePolicyId: row.original.attendancePolicyId,
      });
    },
  },
];
