import { Router } from "express";
import authorize from "../../middlewares/auth.middleware.js";
import { getContacts, findUser, blockUser, unblockUser, saveContact, } from "./contact.controller.js";

const router = Router();

router.get("/", authorize, getContacts);
router.get("/find-user", authorize, findUser);
router.post("/block-user/:id", authorize, blockUser);
router.post("/unblock-user/:id", authorize, unblockUser);
router.post("/save-contact", authorize, saveContact);

export default router;
