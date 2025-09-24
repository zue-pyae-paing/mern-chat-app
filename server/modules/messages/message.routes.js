import { Router } from "express";
import upload from "../../middlewares/upload.middleware.js";
import authorize from "../../middlewares/auth.middleware.js";
import checkBlock from "../../middlewares/checkBlocked.middleware.js";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  replyToMessage,
  pinMessage,
  unpinMessage,
  getPinnedMessage,
  messageStatus,
} from "./message.controller.js";

const router = Router();

router.get("/:conversationId", authorize, getMessages);

router.post(
  "/:conversationId",
  authorize,
  checkBlock,
  upload.array("files"),
  sendMessage
);

router.put("/:conversationId/:messageId", authorize, editMessage);

router.post("/reply/:conversationId/:messageId", authorize, replyToMessage);

router.put("/pin/:conversationId/:messageId", authorize, pinMessage);

router.put("/unpin/:conversationId/:messageId", authorize, unpinMessage);

router.get("/pin/:conversationId", authorize, getPinnedMessage);

router.put("/status/:conversationId/:messageId", authorize, messageStatus);

router.delete("/:conversationId/delete/:messageId", authorize, deleteMessage);

export default router;
