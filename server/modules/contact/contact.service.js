import createError from "http-errors";
import User from "../../models/user.model.js";
import Conversation from "../../models/conversation.model.js";

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
        .populate({
          path: "blocked",
          select: "_id username avatar status lastSeen",
        })
        .lean();

      if (!currentUser) {
        throw createError.NotFound("User not found");
      }

      const contacts =
        currentUser.contacts ||
        [].filter((contact) => !contact.includes(userId));

      return {
        success: true,
        data: {
          message: "Contacts fetched successfully",
          contacts,
          blocked: currentUser.blocked || [],
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  addContact: async (userId, contactEmail) => {
    try {
      const user = await User.findById(userId);
      const contactUser = await User.findOne({ email: contactEmail }).select(
        "username email avatar status lastSeen _id"
      );

      if (!user) throw createError.NotFound("User not found");
      if (!contactUser) throw createError.NotFound("Contact User not found");

      if (user._id.toString() === contactUser._id.toString()) {
        throw createError.BadRequest("You cannot add yourself as a contact");
      }

      if (user.contacts.includes(contactUser._id)) {
        throw createError.BadRequest("Contact already exists");
      }

      // Generate participantKey
      const participantKey = [user._id.toString(), contactUser._id.toString()]
        .sort()
        .join("_");

      // Check existing conversation
      let conversation = await Conversation.findOne({ participantKey });

      if (!conversation) {
        conversation = await Conversation.create({
          type: "private",
          participantKey,
          participants: [user._id, contactUser._id],
        });
      }

      user.contacts.push(contactUser._id);
      await user.save();

      return {
        success: true,
        data: {
          message: "Contact added successfully",
          contact: contactUser,
          conversationId: conversation._id,
        },
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

  listBlockedUsers: async (userId, search) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      const blockedUsers = await User.find({
        _id: { $in: user.blocked },
      })
        .select("username email avatar")
        .populate({
          path: "blocked",
          match: search ? { username: { $regex: search, $options: "i" } } : {},
        });
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
