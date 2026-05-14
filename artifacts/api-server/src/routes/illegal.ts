import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, illegalOrgsTable } from "@workspace/db";
import { ListIllegalOrgsResponse, UpdateIllegalOrgParams, UpdateIllegalOrgResponse, UpdateIllegalOrgBody } from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/illegal", async (_req, res): Promise<void> => {
  const orgs = await db.select().from(illegalOrgsTable).orderBy(illegalOrgsTable.id);
  res.json(ListIllegalOrgsResponse.parse(orgs));
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

  const [org] = await db
    .update(illegalOrgsTable)
    .set(parsed.data)
    .where(eq(illegalOrgsTable.id, params.data.id))
    .returning();

  if (!org) {
    res.status(404).json({ error: "Illegal organization not found" });
    return;
  }

  res.json(UpdateIllegalOrgResponse.parse(org));
});

export default router;
