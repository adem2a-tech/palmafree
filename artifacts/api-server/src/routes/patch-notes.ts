import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, patchNotesTable } from "@workspace/db";
import {
  ListPatchNotesResponse,
  CreatePatchNoteBody,
  UpdatePatchNoteParams,
  UpdatePatchNoteBody,
  UpdatePatchNoteResponse,
  DeletePatchNoteParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/patch-notes", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(patchNotesTable)
    .orderBy(asc(patchNotesTable.sortOrder), asc(patchNotesTable.id));
  res.json(ListPatchNotesResponse.parse(rows));
});

router.post("/admin/patch-notes", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreatePatchNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(patchNotesTable)
    .values({
      version: parsed.data.version,
      date: parsed.data.date,
      category: parsed.data.category,
      changes: parsed.data.changes,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  res.status(201).json(UpdatePatchNoteResponse.parse(row));
});

router.patch("/admin/patch-notes/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdatePatchNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatchNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch = parsed.data;
  const updates: {
    version?: string;
    date?: string;
    category?: string;
    changes?: string[];
    sortOrder?: number;
  } = {};
  if (patch.version !== undefined) updates.version = patch.version;
  if (patch.date !== undefined) updates.date = patch.date;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.changes !== undefined) updates.changes = patch.changes;
  if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [row] = await db
    .update(patchNotesTable)
    .set(updates)
    .where(eq(patchNotesTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Patch note introuvable" });
    return;
  }

  res.json(UpdatePatchNoteResponse.parse(row));
});

router.delete("/admin/patch-notes/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeletePatchNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(patchNotesTable)
    .where(eq(patchNotesTable.id, params.data.id))
    .returning({ id: patchNotesTable.id });

  if (!row) {
    res.status(404).json({ error: "Patch note introuvable" });
    return;
  }

  res.status(204).send();
});

export default router;
