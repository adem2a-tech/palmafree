import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  pseudo: text("pseudo").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Fondateur | Co-Fondateur | Administration | Modération | Développeurs | Support
  avatarUrl: text("avatar_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staffTable.$inferSelect;
