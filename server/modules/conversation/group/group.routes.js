import { Router } from "express";
import {
  createGroup,
  addGroupMembers,
  removeGroupMembers,
  leaveGroup,
  renameGroup,
  changeGroupImage,
  changeGroupDescription,
  transferGroupAdmin,
  deleteGroup,
  listGroupsForUser,
} from "./group.controller.js";

import authorize from "../../../middlewares/auth.middleware.js";
import isGroupAdmin from "../../../middlewares/groupAdmin.middleware.js";
import upload from "../../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authorize, listGroupsForUser);
router.post("/", authorize, createGroup);
router.put("/:conversationId/name", authorize, isGroupAdmin, renameGroup);
router.put(
  "/:conversationId/avatar",
  authorize,
  isGroupAdmin,
  upload.single("groupImage"),
  changeGroupImage
);
router.put(
  "/:conversationId/description",
  authorize,
  isGroupAdmin,
  changeGroupDescription
);
router.post("/:conversationId/members", authorize, isGroupAdmin, addGroupMembers); 
router.delete(
  "/:conversationId/members",
  authorize,
  isGroupAdmin,
  removeGroupMembers
); 
router.post("/:conversationId/leave", authorize, leaveGroup); 
router.put("/:conversationId/admin", authorize, isGroupAdmin, transferGroupAdmin);
router.delete("/:conversationId", authorize, isGroupAdmin, deleteGroup);

export default router;
