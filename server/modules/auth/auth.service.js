import bcrypt from "bcrypt";
import createError from "http-errors";
import crypto from "crypto";
import User from "../../models/user.model.js";
import { generateToken } from "../../utils/token.js";

const authService = {
  register: async (data) => {
    const { username, email, password } = data;
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        throw createError.Conflict("User already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        email,
        password: hashedPassword,
      });
      return { message: "User created successfully" };
    } catch (error) {
      throw error;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw createError.NotFound("User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw createError.Unauthorized("Invalid credentials");
      }

      const token = generateToken(user._id);

      const userData = user.toObject();
      const { password: userPassword, ...userWithoutPassword } = userData;

      return {
        success: true,
        data: { token, message: "Login successful", user: userWithoutPassword },
      };
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
      await user.save();
      return { resetToken };
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (resetToken, newPassword) => {
    try {
      const user = await User.findOne({ resetToken });
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const expirationTime = user.resetTokenExpiration;
      if (Date.now() > expirationTime) {
        throw createError.BadRequest("Reset token has expired");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await user.save();
      return { message: "Password reset successful" };
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
