import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import illegalRouter from "./illegal";
import staffRouter from "./staff";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(illegalRouter);
router.use(staffRouter);
router.use(adminRouter);

export default router;
