import { Router } from "express";
import {
  getUser,
  changePassword,
  chageAvatar,
  deleteAccount,
  changeBio,
  changeUsername,
} from "./user.controller.js";
import authorize from "../../middlewares/auth.middleware.js";
import {
  bioValidation,
  changePasswordValidation,
  usernameValidation,
} from "../../validations/user.validations.js";
import { validate } from "../../middlewares/validation.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authorize, getUser);
router.post(
  "/change-username",
  authorize,
  usernameValidation,
  validate,
  changeUsername
);
router.post(
  "/change-password",
  authorize,
  changePasswordValidation,
  validate,
  changePassword
);
router.post("/change-avatar", authorize, upload.single("avatar"), chageAvatar);
router.post("/change-bio", authorize, bioValidation, validate, changeBio);
router.delete("/delete-account", authorize, deleteAccount);

export default router;
