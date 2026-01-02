import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { member, organization } from "./organization";

export const leave = sqliteTable(
  "leave",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    days: real("days").notNull(),
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

export const leaveBalance = sqliteTable(
  "leave_balance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    leaveId: text("leave_id")
      .notNull()
      .references(() => leave.id, { onDelete: "cascade" }),
    totalDays: real("total_days").notNull(),
    usedDays: real("used_days").notNull().default(0),
    pendingDays: real("pending_days").notNull().default(0),
    year: integer("year").notNull(), // For annual tracking
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("leave_balance_member_leave_year_idx").on(table.memberId, table.leaveId, table.year),
    unique("leave_balance_unique_idx").on(table.memberId, table.leaveId, table.year),
  ],
);

export const leaveBalanceAdjustment = sqliteTable(
  "leave_balance_adjustment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    balanceId: text("balance_id")
      .notNull()
      .references(() => leaveBalance.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    leaveId: text("leave_id")
      .notNull()
      .references(() => leave.id, { onDelete: "cascade" }),
    adjustmentType: text("adjustment_type", {
      enum: ["ACCRUAL", "USAGE", "ADJUSTMENT", "CARRY_FORWARD"],
    }).notNull(),
    days: real("days").notNull(),
    reason: text("reason"),
    adjustedBy: text("adjusted_by").references(() => member.id),
    requestId: text("request_id").references(() => leaveRequest.id), // Link to leave request if applicable
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("leave_balance_adjustment_balance_id_idx").on(table.balanceId),
    index("leave_balance_adjustment_member_id_idx").on(table.memberId),
    index("leave_balance_adjustment_leave_request_id_idx").on(table.requestId),
  ],
);
