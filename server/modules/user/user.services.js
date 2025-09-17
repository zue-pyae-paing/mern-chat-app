import User from "../../models/user.model.js";
import createError from "http-errors";
import bcrypt from "bcrypt";
import imageKit from "../../config/imageKit.js";
import { uploadFolder } from "../../utils/uploadFolder.js";


const userService = {
  getUser: async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const userObject = user.toObject();
      const { password: userPassword, ...userWithoutPassword } = userObject;
      return { success: true, data: userWithoutPassword };
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (data, userId) => {
    try {
      const { oldPassword, newPassword } = data;
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw createError.Unauthorized("Invalid credentials");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return {
        success: true,
        data: { message: "Password changed successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
  changeUsername: async (username, userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      user.username = username;
      await user.save();
      return {
        success: true,
        data: { message: "Username changed successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
  chageAvatar: async (file, userId) => {
    try {
      if (!file) {
        throw createError.BadRequest("File is required");
      }
      const avatar = await imageKit.upload({
        file: file.buffer,
        fileName: `avatar-${Date.now()}-${file.originalname}`,
        folder: uploadFolder(file.mimetype),
      });
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      if (user.avatarPublicId) {
        await imageKit.deleteFile(user.avatarPublicId);
      }
      user.avatar = avatar.url;
      user.avatarPublicId = avatar.fileId;
      await user.save();
      return {
        success: true,
        data: { message: "Avatar changed successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
  changeBio: async (bio, userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      user.bio = bio;
      await user.save();
      return {
        success: true,
        data: { message: "Bio changed successfully" },
      };
    } catch (error) {
      throw error;
    }
  },



  deleteAccount: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      if (user.avatarPublicId) {
        await imageKit.deleteFile(user.avatarPublicId);
      }
      await user.remove();
      return {
        success: true,
        data: { message: "Account deleted successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
