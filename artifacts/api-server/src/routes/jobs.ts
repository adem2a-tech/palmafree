import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  ListJobsResponse,
  CreateJobBody,
  UpdateJobParams,
  UpdateJobResponse,
  UpdateJobBody,
  DeleteJobParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/jobs", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).orderBy(asc(jobsTable.id));
  res.json(ListJobsResponse.parse(jobs));
});

router.post("/admin/jobs", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .insert(jobsTable)
    .values({
      name: parsed.data.name,
      category: parsed.data.category,
      available: parsed.data.available ?? true,
      discordLink: parsed.data.discordLink ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning();

  res.status(201).json(UpdateJobResponse.parse(job));
});

router.patch("/admin/jobs/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch = parsed.data;
  const updates: {
    name?: string;
    category?: string;
    available?: boolean;
    discordLink?: string | null;
    imageUrl?: string | null;
  } = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.available !== undefined) updates.available = patch.available;
  if (patch.discordLink !== undefined) updates.discordLink = patch.discordLink;
  if (patch.imageUrl !== undefined) updates.imageUrl = patch.imageUrl;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [job] = await db
    .update(jobsTable)
    .set(updates)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateJobResponse.parse(job));
});

router.delete("/admin/jobs/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(jobsTable)
    .where(eq(jobsTable.id, params.data.id))
    .returning({ id: jobsTable.id });

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.status(204).send();
});

export default router;
