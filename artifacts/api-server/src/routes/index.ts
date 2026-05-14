import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import illegalRouter from "./illegal";
import loreRouter from "./lore";
import patchNotesRouter from "./patch-notes";
import galleryRouter from "./gallery";
import staffRouter from "./staff";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(illegalRouter);
router.use(loreRouter);
router.use(patchNotesRouter);
router.use(galleryRouter);
router.use(staffRouter);
router.use(adminRouter);

export default router;
