import { Router } from "express";
import privateRoutes from "../conversation/private/private.routes.js";
import groupRoutes from "../conversation/group/group.routes.js";

const router = Router();

router.use("/private", privateRoutes);
router.use("/group", groupRoutes);

export default router;
