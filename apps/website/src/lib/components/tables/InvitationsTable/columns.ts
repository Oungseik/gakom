import { renderComponent } from "@repo/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDate } from "$lib/utils";
import DataTableActions from "./DataTableActions.svelte";
import DataTableRole from "./DataTableRole.svelte";
import DataTableStatus from "./DataTableStatus.svelte";

export type Invitation = {
  id: string;
  email: string;
  role?: string | null;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  organizationId: string;
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
        email: row.original.email,
        status: row.original.status,
      });
    },
  },
];
