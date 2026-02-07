import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { attendancePolicy } from "./attendance";
import { user } from "./auth";

export const organization = pgTable(
  "organization",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("organization_slug_idx").on(table.slug)],
);

export const member = pgTable(
  "member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: text("position").notNull(),
    attendancePolicyId: text("attendance_policy_id").references(() => attendancePolicy.id),
    role: text("role", { enum: ["OWNER", "ADMIN", "MEMBER"] })
      .default("MEMBER")
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    leftAt: timestamp("updated_at"),
  },
  (table) => [
    index("member_organization_id_idx").on(table.organizationId),
    index("member_user_id_idx").on(table.userId),
  ],
);
