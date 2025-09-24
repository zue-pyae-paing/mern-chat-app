import User from "../../models/user.model.js";
import createError from "http-errors";
const contactService = {
  listContacts: async (userId, search) => {
    try {
      const currentUser = await User.findById(userId)
        .select("contacts blocked")
        .populate({
          path: "contacts",
          match: search ? { username: { $regex: search, $options: "i" } } : {},
          select: "username avatar status lastSeen",
        })
        .lean();

      if (!currentUser) {
        throw createError.NotFound("User not found");
      }

      // Blocked ကို filter လုပ်မယ်
      const contacts = (currentUser.contacts || []).filter(
        (c) => !currentUser.blocked.includes(c._id)
      );

      return {
        success: true,
        data: { message: "Contacts fetched successfully", contacts },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  addContact: async (userId, contactEmail) => {
    try {
      const user = await User.findById(userId);
      const contactUser = await User.findOne({ email: contactEmail });
      if (!user) {
        throw createError.NotFound("User not found");
      }
      if (user.contacts.includes(contactUser._id)) {
        throw createError.BadRequest("Contact already exists");
      }
      user.contacts.push(contactUser._id);
      await user.save();

      return {
        success: true,
        data: { message: "Contact saved successfully" },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  searchUsers: async (search) => {
    try {
      if (!search) {
        return { success: true, users: [] };
      }
      const users = await User.find({
        email: { $regex: search, $options: "i" },
      }).select("username email avatar status");
      return { success: true, users };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  blockUser: async (userId, blockedUserId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }

      const targetUser = await User.findById(blockedUserId);
      if (!targetUser) {
        throw createError.NotFound("Target user not found");
      }

      const alreadyBlocked = user.blocked.some(
        (id) => id.toString() === blockedUserId
      );
      if (alreadyBlocked) {
        throw createError.BadRequest("User already blocked");
      }

      user.blocked.push(blockedUserId);
      await user.save();

      return {
        success: true,
        message: "User blocked successfully",
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  unblockUser: async (userId, blockedUserId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      if (!user.blocked.includes(blockedUserId)) {
        throw createError.BadRequest("User is not blocked");
      }
      user.blocked.pull(blockedUserId);
      await user.save();
      return {
        success: true,
        message: "User unblocked successfully",
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  listBlockedUsers: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const blockedUsers = await User.find({
        _id: { $in: user.blocked },
      }).select("username email avatar");
      return {
        success: true,
        data: { message: "Blocked users fetched successfully", blockedUsers },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  deleteContact: async (userId, contactId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      user.contacts.pull(contactId);
      await user.save();
      return {
        success: true,
        message: "Contact deleted successfully",
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
};

export default contactService;
