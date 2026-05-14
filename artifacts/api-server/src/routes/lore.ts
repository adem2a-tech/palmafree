import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, loreTable } from "@workspace/db";
import {
  ListLoreResponse,
  CreateLoreBody,
  UpdateLoreParams,
  UpdateLoreBody,
  UpdateLoreResponse,
  DeleteLoreParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/lore", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(loreTable)
    .orderBy(asc(loreTable.sortOrder), asc(loreTable.id));
  res.json(ListLoreResponse.parse(rows));
});

router.post("/admin/lore", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateLoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(loreTable)
    .values({
      title: parsed.data.title,
      summary: parsed.data.summary,
      sortOrder: parsed.data.sortOrder ?? 0,
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning();

  res.status(201).json(UpdateLoreResponse.parse(row));
});

router.patch("/admin/lore/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdateLoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch = parsed.data;
  const updates: { title?: string; summary?: string; sortOrder?: number; imageUrl?: string | null } = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.summary !== undefined) updates.summary = patch.summary;
  if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;
  if (patch.imageUrl !== undefined) updates.imageUrl = patch.imageUrl;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [row] = await db
    .update(loreTable)
    .set(updates)
    .where(eq(loreTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Lore introuvable" });
    return;
  }

  res.json(UpdateLoreResponse.parse(row));
});

router.delete("/admin/lore/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeleteLoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(loreTable)
    .where(eq(loreTable.id, params.data.id))
    .returning({ id: loreTable.id });

  if (!row) {
    res.status(404).json({ error: "Lore introuvable" });
    return;
  }

  res.status(204).send();
});

export default router;
