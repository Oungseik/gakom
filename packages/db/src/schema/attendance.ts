import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TIMEZONES } from "../timezone";
import { user } from "./core";
import { organization } from "./organization";

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

export const attendance = sqliteTable(
  "attendance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    attendancePolicyId: text("attendance_policy_id")
      .notNull()
      .references(() => attendancePolicy.id, { onDelete: "cascade" }),
    checkedInAt: integer("checked_in_at", { mode: "timestamp_ms" }),
    checkedOutAt: integer("checked_out_at", { mode: "timestamp_ms" }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    accuracy: real("accuracy").notNull(),
  },
  (table) => [
    index("attendance_user_id_idx").on(table.userId),
    index("attendance_organization_id_idx").on(table.attendancePolicyId),
  ],
);
