import { body } from "express-validator";

export const changePasswordValidation = [
  body("oldPassword")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
  body("newPassword")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
];

export const usernameValidation = [
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
];

export const bioValidation = [
  body("bio")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 160 })
    .withMessage("Bio must be between 3 and 160 characters"),
];
