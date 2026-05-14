import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const illegalOrgsTable = pgTable("illegal_orgs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // Recrute | Complet | Fermé
  activities: text("activities").array().notNull(),
  discordLink: text("discord_link"),
});

export const insertIllegalOrgSchema = createInsertSchema(illegalOrgsTable).omit({ id: true });
export type InsertIllegalOrg = z.infer<typeof insertIllegalOrgSchema>;
export type IllegalOrg = typeof illegalOrgsTable.$inferSelect;
