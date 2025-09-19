import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../../validations/auth.validations.js";

const router = Router();

router.post("/register", registerValidation, validate, register);

router.post("/login", loginValidation, validate, login);

router.post(
  "/password/forgot",
  forgotPasswordValidation,
  validate,
  forgotPassword
);

router.put(
  "/password/reset/:resetToken",
  resetPasswordValidation,
  validate,
  resetPassword
);

export default router;
