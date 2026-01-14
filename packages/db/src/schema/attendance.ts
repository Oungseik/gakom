import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TIMEZONES } from "../timezone";
import { user } from "./core";
import { member, organization } from "./organization";

export type Day = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export const attendancePolicy = sqliteTable(
  "attendance_policy",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    timezone: text("timezone", { enum: TIMEZONES }).notNull(),
    clockInSec: integer("clock_in_sec").notNull(),
    clockOutSec: integer("clock_out_sec").notNull(),
    workdays: text("work_days", { mode: "json" })
      .$type<Day[]>()
      .default(["MON", "TUE", "WED", "THU", "FRI"])
      .notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },

  (table) => [index("attendance_policy_organization_id_idx").on(table.organizationId)],
);

export type AttendanceLocation = { latitude: number; longitude: number; accuracy: number };

export const attendance = sqliteTable(
  "attendance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    attendancePolicyId: text("attendance_policy_id")
      .notNull()
      .references(() => attendancePolicy.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    checkInAt: integer("check_in_at", { mode: "timestamp_ms" }),
    checkOutAt: integer("check_out_at", { mode: "timestamp_ms" }),
    checkInLocation: text("check_in_location", { mode: "json" }).$type<AttendanceLocation>(),
    checkOutLocation: text("check_out_location", { mode: "json" }).$type<AttendanceLocation>(),
    workedSeconds: integer("worked_seconds").default(0),
    status: text("status", { enum: ["PRESENT", "LATE", "EARLY_LEAVE", "ABSENT", "INCOMPLETE"] })
      .default("ABSENT")
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("attendance_user_date_idx").on(table.userId, table.date),
    index("attendance_member_date_idx").on(table.memberId, table.date),
    index("attendance_org_date_idx").on(table.organizationId, table.date),
    index("attendance_status_idx").on(table.status),
  ],
);
