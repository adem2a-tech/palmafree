import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, illegalOrgsTable } from "@workspace/db";
import {
  ListIllegalOrgsResponse,
  CreateIllegalOrgBody,
  UpdateIllegalOrgParams,
  UpdateIllegalOrgResponse,
  UpdateIllegalOrgBody,
  DeleteIllegalOrgParams,
} from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const ILLEGAL_SEGMENTS = ["Gang", "Organisation", "Indépendant"] as const;
type IllegalSegment = (typeof ILLEGAL_SEGMENTS)[number];

function normalizeSegment(raw: string | undefined | null): IllegalSegment {
  const t = (raw ?? "").trim();
  return (ILLEGAL_SEGMENTS as readonly string[]).includes(t) ? (t as IllegalSegment) : "Organisation";
}

const router: IRouter = Router();

router.get("/illegal", async (_req, res): Promise<void> => {
  const orgs = await db.select().from(illegalOrgsTable).orderBy(asc(illegalOrgsTable.id));
  res.json(ListIllegalOrgsResponse.parse(orgs));
});

router.post("/admin/illegal", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateIllegalOrgBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [org] = await db
    .insert(illegalOrgsTable)
    .values({
      name: parsed.data.name,
      status: parsed.data.status,
      activities: parsed.data.activities,
      discordLink: parsed.data.discordLink ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      segment: normalizeSegment(parsed.data.segment),
    })
    .returning();

  res.status(201).json(UpdateIllegalOrgResponse.parse(org));
});

router.patch("/admin/illegal/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdateIllegalOrgParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIllegalOrgBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patch = parsed.data;
  const updates: {
    name?: string;
    status?: string;
    activities?: string[];
    discordLink?: string | null;
    imageUrl?: string | null;
    segment?: string;
  } = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.activities !== undefined) updates.activities = patch.activities;
  if (patch.discordLink !== undefined) updates.discordLink = patch.discordLink;
  if (patch.imageUrl !== undefined) updates.imageUrl = patch.imageUrl;
  if (patch.segment !== undefined) updates.segment = normalizeSegment(patch.segment);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Aucun champ à mettre à jour" });
    return;
  }

  const [org] = await db
    .update(illegalOrgsTable)
    .set(updates)
    .where(eq(illegalOrgsTable.id, params.data.id))
    .returning();

  if (!org) {
    res.status(404).json({ error: "Illegal organization not found" });
    return;
  }

  res.json(UpdateIllegalOrgResponse.parse(org));
});

router.delete("/admin/illegal/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeleteIllegalOrgParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(illegalOrgsTable)
    .where(eq(illegalOrgsTable.id, params.data.id))
    .returning({ id: illegalOrgsTable.id });

  if (!row) {
    res.status(404).json({ error: "Illegal organization not found" });
    return;
  }

  res.status(204).send();
});

export default router;
