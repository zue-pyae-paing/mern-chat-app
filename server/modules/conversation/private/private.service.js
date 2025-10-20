import createError from "http-errors";
import Conversation from "../../../models/conversation.model.js";
import Message from "../../../models/message.model.js";
import imageKit from "../../../config/imageKit.js";
import User from "../../../models/user.model.js";

const conversationService = {
  getAllConversations: async (userId, serach, cursor, limit = 20) => {
    try {
      if (!userId) throw createError.BadRequest("User ID is required");
      const query = {
        participants: userId,
      };

      if (cursor) {
        query.updatedAt = { $lt: new Date(cursor) };
      }

      let conversations = await Conversation.find(query)
        .populate({
          path: "participants",
          select: "username avatar status lastSeen",
        })
        .populate({
          path: "lastMessage",
          match: { _id: { $ne: null } },
          populate: { path: "sender", select: "username avatar" },
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
      if (serach) {
        const regex = new RegExp(serach, "i");
        conversations = conversations.filter(
          (c) => regex.test(c.name) || regex.test(c.participants[1].username)
        );
      }
      return {
        success: true,
        data: {
          message: "Conversations fetched successfully",
          conversations,
          nextCursor: conversations[conversations.length - 1]?.updatedAt,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  getPrivateConversations: async (userId, search, cursor, limit = 20) => {
    try {
      if (!userId) throw createError.BadRequest("User ID is required");

      const query = {
        type: "private",
        participants: userId,
      };

      if (cursor) {
        query.updatedAt = { $lt: new Date(cursor) };
      }

      let conversations = await Conversation.find(query)
        .populate({
          path: "participants",
          select: "username avatar status lastSeen",
        })
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username avatar" },
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();

      // 👉 filter only counterpart
      conversations = conversations.map((c) => {
        c.counterpart = c.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );
        return c;
      });

      // 👉 search by counterpart username
      if (search) {
        const regex = new RegExp(search, "i");
        conversations = conversations.filter(
          (c) => c.counterpart && regex.test(c.counterpart.username)
        );
      }

      return {
        success: true,
        data: {
          message: "Private conversations fetched successfully",
          conversations,
          nextCursor:
            conversations.length > 0
              ? conversations[conversations.length - 1].updatedAt
              : null,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  createConversation: async (userId, participantId) => {
    try {
      if (!userId || !participantId) {
        throw createError.BadRequest("User IDs are required");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw createError.NotFound("User not found");
      }

      if (userId === participantId) {
        throw createError.BadRequest(
          "Cannot create conversation with yourself"
        );
      }
      const invalidUser = await User.findById(participantId);
      if (!invalidUser) {
        throw createError.NotFound("Target user not found");
      }
      const participantKey = [userId, participantId].sort().join("_");

      // Check if exists
      const existing = await Conversation.findOne({
        type: "private",
        participantKey,
      }).populate("participants", "username avatar status lastSeen");

      if (existing) {
        return {
          success: true,

          data: {
            message: "Conversation already exists",
            conversation: existing,
          },
        };
      }

      // Create new
      const newConversation = await Conversation.create({
        type: "private",
        participantKey,
        participants: [userId, participantId],
      });

      const conversation = await Conversation.findById(
        newConversation._id
      ).populate("participants", "username avatar status lastSeen");

      return {
        success: true,
        data: { message: "Conversation created successfully", conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  deletePrivateConversation: async (userId, conversationId) => {
    try {
      if (!userId) throw createError.BadRequest("User ID is required");
      if (!conversationId)
        throw createError.BadRequest("Conversation ID is required");

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");

      if (!conversation.participants.includes(userId.toString())) {
        throw createError.Forbidden(
          "You are not allowed to delete this conversation"
        );
      }

      const messages = await Message.find({ conversation: conversationId });
      for (const msg of messages) {
        if (msg.attachments) {
          for (const attachment of msg.attachments) {
            await imageKit.deleteFile(attachment.fileId);
          }
        }
      }

      await Message.deleteMany({ conversation: conversationId });
      await Conversation.findByIdAndDelete(conversationId);

      return {
        success: true,
        message: "Conversation deleted successfully",
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
};

export default conversationService;
