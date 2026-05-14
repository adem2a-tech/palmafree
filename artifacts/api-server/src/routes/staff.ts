import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import { ListStaffResponse, UpdateStaffResponse, UpdateStaffParams, UpdateStaffBody, DeleteStaffParams, AdminListStaffResponse, CreateStaffBody } from "@workspace/api-zod";
import { adminAuth } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.get("/staff", async (_req, res): Promise<void> => {
  const staff = await db.select().from(staffTable).orderBy(staffTable.sortOrder);
  res.json(ListStaffResponse.parse(staff));
});

router.get("/admin/staff", adminAuth, async (_req, res): Promise<void> => {
  const staff = await db.select().from(staffTable).orderBy(staffTable.sortOrder);
  res.json(AdminListStaffResponse.parse(staff));
});

router.post("/admin/staff", adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db.insert(staffTable).values(parsed.data).returning();
  res.status(201).json(UpdateStaffResponse.parse(member));
});

router.patch("/admin/staff/:id", adminAuth, async (req, res): Promise<void> => {
  const params = UpdateStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db
    .update(staffTable)
    .set(parsed.data)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.json(UpdateStaffResponse.parse(member));
});

router.delete("/admin/staff/:id", adminAuth, async (req, res): Promise<void> => {
  const params = DeleteStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .delete(staffTable)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
