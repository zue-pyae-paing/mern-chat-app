import { Router } from "express";
import authorize from "../../middlewares/auth.middleware.js";
import {
  listContacts,
  searchUsers,
  blockUser,
  unblockUser,
  addContact,
  listBlockedUsers,
  deleteContact,
} from "./contact.controller.js";

const router = Router();

router.get("/", authorize, listContacts);

router.get("/search", authorize, searchUsers);

router.get("/blocked", authorize, listBlockedUsers);

router.patch("/block/:id", authorize, blockUser);
router.patch("/unblock/:id", authorize, unblockUser);

router.post("/", authorize, addContact);

router.delete("/:id", authorize, deleteContact);

export default router;
