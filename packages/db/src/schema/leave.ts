import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { member, organization } from "./organization";

export const leave = sqliteTable(
  "leave",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    days: integer("days").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("leave_policy_organization_id_idx").on(table.organizationId)],
);

export const leaveRequest = sqliteTable(
  "leave_request",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "no action" }),
    leaveId: text("leaveId")
      .notNull()
      .references(() => leave.id, { onDelete: "cascade" }),
    startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
    status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] })
      .default("PENDING")
      .notNull(),
    reason: text("reason"),
    reviewerId: text("reviewer_id").references(() => member.id),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("leave_request_member_id_idx").on(table.memberId),
    index("leave_request_leave_id_idx").on(table.leaveId),
    index("leave_request_status_idx").on(table.status),
    index("leave_request_dates_idx").on(table.startDate, table.endDate),
    index("leave_request_reviewer_idx").on(table.reviewerId),
  ],
);
