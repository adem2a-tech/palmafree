import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, galleryItemsTable } from "@workspace/db";
import {
  ListGalleryResponse,
  CreateGalleryItemBody,
  UpdateGalleryItemParams,
  UpdateGalleryItemBody,
  UpdateGalleryItemResponse,
  DeleteGalleryItemParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/gallery", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(galleryItemsTable)
    .orderBy(asc(galleryItemsTable.sortOrder), asc(galleryItemsTable.id));
  res.json(ListGalleryResponse.parse(rows));
});

router.post("/admin/gallery", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(galleryItemsTable)
    .values({
      imageUrl: parsed.data.imageUrl.trim(),
      description: parsed.data.description.trim(),
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  res.status(201).json(UpdateGalleryItemResponse.parse(row));
});

router.patch("/admin/gallery/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdateGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch = parsed.data;
  const updates: { imageUrl?: string; description?: string; sortOrder?: number } = {};
  if (patch.imageUrl !== undefined) updates.imageUrl = patch.imageUrl.trim();
  if (patch.description !== undefined) updates.description = patch.description.trim();
  if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [row] = await db
    .update(galleryItemsTable)
    .set(updates)
    .where(eq(galleryItemsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Élément introuvable" });
    return;
  }

  res.json(UpdateGalleryItemResponse.parse(row));
});

router.delete("/admin/gallery/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeleteGalleryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(galleryItemsTable)
    .where(eq(galleryItemsTable.id, params.data.id))
    .returning({ id: galleryItemsTable.id });

  if (!row) {
    res.status(404).json({ error: "Élément introuvable" });
    return;
  }

  res.status(204).send();
});

export default router;
