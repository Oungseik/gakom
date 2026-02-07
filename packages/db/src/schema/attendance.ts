import { ATTENDANCE_STATUS, type Days, TIMEZONES } from "@repo/config";
import { index, integer, json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { member, organization } from "./organization";

export const attendancePolicy = pgTable(
  "attendance_policy",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    timezone: text("timezone", { enum: TIMEZONES }).notNull(),
    clockInSec: integer("clock_in_sec").notNull(),
    clockOutSec: integer("clock_out_sec").notNull(),
    workdays: json("work_days").$type<Days[]>().notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("attendance_policy_organization_id_idx").on(table.organizationId)],
);

export type AttendancePolicySelect = typeof attendancePolicy.$inferSelect;
export type AttendancePolicyInsert = typeof attendancePolicy.$inferInsert;

export type AttendanceLocation = { latitude: number; longitude: number; accuracy: number };

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    attendancePolicyId: uuid("attendance_policy_id")
      .notNull()
      .references(() => attendancePolicy.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    checkInAt: timestamp("check_in_at"),
    checkOutAt: timestamp("check_out_at"),
    checkInLocation: text("check_in_location"),
    checkOutLocation: text("check_out_location"),
    workedSeconds: integer("worked_seconds").default(0),
    status: text("status", { enum: ATTENDANCE_STATUS }).default("ABSENT").notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("attendance_user_date_idx").on(table.userId, table.date),
    index("attendance_member_date_idx").on(table.memberId, table.date),
    index("attendance_org_date_idx").on(table.organizationId, table.date),
    index("attendance_status_idx").on(table.status),
  ],
);

export type AttendanceSelect = typeof attendance.$inferSelect;
export type AttendanceInsert = typeof attendance.$inferInsert;
