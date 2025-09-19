import { Router } from "express";
import {
  getUser,
  changePassword,
  changeAvatar,
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

router.get("/me", authorize, getUser);

router.put(
  "/me/username",
  authorize,
  usernameValidation,
  validate,
  changeUsername
);

router.put(
  "/me/password",
  authorize,
  changePasswordValidation,
  validate,
  changePassword
);

router.put("/me/avatar", authorize, upload.single("avatar"), changeAvatar);

router.put("/me/bio", authorize, bioValidation, validate, changeBio);

router.delete("/me", authorize, deleteAccount);

export default router;
