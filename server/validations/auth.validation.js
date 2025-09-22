import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
  body("email").trim().notEmpty().isEmail().withMessage("Invalid email"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
];

export const loginValidation = [
  body("email").trim().notEmpty().isEmail().withMessage("Invalid email"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
];

export const forgotPasswordValidation = [
  body("email").trim().notEmpty().isEmail().withMessage("Invalid email"),
];


export const resetPasswordValidation = [
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
];