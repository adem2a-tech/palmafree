import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import { ListJobsResponse, UpdateJobParams, UpdateJobResponse, UpdateJobBody } from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/jobs", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(jobsTable).orderBy(jobsTable.id);
  res.json(ListJobsResponse.parse(jobs));
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

  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateJobResponse.parse(job));
});

export default router;
