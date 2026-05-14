import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patchNotesTable = pgTable("patch_notes", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  changes: jsonb("changes").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertPatchNoteSchema = createInsertSchema(patchNotesTable).omit({ id: true });
export type InsertPatchNote = z.infer<typeof insertPatchNoteSchema>;
export type PatchNoteRow = typeof patchNotesTable.$inferSelect;
