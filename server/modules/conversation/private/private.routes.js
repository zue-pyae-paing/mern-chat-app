import { Router } from "express";
import {
  getPrivateConversations,
  createConversation,
  deletePrivateConversation,
} from "./private.controller.js";
import authorize from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authorize, getPrivateConversations);
router.post("/create/:id", authorize, createConversation);
router.delete("/delete/:id", authorize, deletePrivateConversation);

export default router;
