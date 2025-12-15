import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const image = sqliteTable(
  "image",
  {
    objectPath: text("object_path").primaryKey(),
    filename: text("filename").notNull(),
    uploaderId: text("uploader_id").notNull(),
    type: text("type").notNull().default("image/webp"),
    size: integer("size").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [index("image_uploader_id_idx").on(t.uploaderId)],
);

export type ImageSelect = typeof image.$inferSelect;
export type ImageInsert = typeof image.$inferInsert;
