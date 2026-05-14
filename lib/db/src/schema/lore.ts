import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const loreTable = pgTable("lore", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
});

export const insertLoreSchema = createInsertSchema(loreTable).omit({ id: true });
export type InsertLore = z.infer<typeof insertLoreSchema>;
export type LoreRow = typeof loreTable.$inferSelect;
