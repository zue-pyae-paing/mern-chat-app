import { Router } from "express";
import privateRoutes from "../conversation/private/private.routes.js";
import groupRoutes from "../conversation/group/group.routes.js";
import authorize from "../../middlewares/auth.middleware.js";
import { getAllConversations } from "./private/private.controller.js";

const router = Router();

router.get("/", authorize, getAllConversations);
router.use("/private", privateRoutes);
router.use("/group", groupRoutes);

export default router;
