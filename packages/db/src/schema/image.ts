import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const image = pgTable(
  "image",
  {
    objectPath: text("object_path").primaryKey(),
    filename: text("filename").notNull(),
    uploaderId: text("uploader_id").notNull(),
    type: text("type").notNull().default("image/webp"),
    size: integer("size").notNull(),
    uploadedAt: timestamp("uploaded_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("image_uploader_id_idx").on(t.uploaderId)],
);

export type ImageSelect = typeof image.$inferSelect;
export type ImageInsert = typeof image.$inferInsert;
