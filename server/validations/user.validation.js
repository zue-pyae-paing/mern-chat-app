import { body } from "express-validator";
import path from "path";

export const changePasswordValidation = [
  body("curentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters"),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your new password")
    .isLength({ min: 6, max: 20 })
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const usernameValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(" Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
];

export const avatarValidation = [
  body("avatar").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Avatar is required");
    }

    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace(".", "");
    const mimeType = req.file.mimetype;

    if (!allowedTypes.test(ext) || !allowedTypes.test(mimeType)) {
      throw new Error("Only jpeg, jpg, png and gif files are allowed");
    }

    const fileSize = req.file.size;
    if (fileSize > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    return true;
  }),
];

export const bioValidation = [
  body("bio")
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 160 })
    .withMessage("Bio must be between 3 and 160 characters"),
];
