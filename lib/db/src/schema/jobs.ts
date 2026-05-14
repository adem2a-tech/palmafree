import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Service Public | Entreprises Privées | Freelance
  available: boolean("available").notNull().default(true),
  discordLink: text("discord_link"),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
