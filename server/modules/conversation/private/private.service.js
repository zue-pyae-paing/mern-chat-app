import createError from "http-errors";
import Conversation from "../../../models/conversation.model.js";
import Message from "../../../models/message.model.js";
import imageKit from "../../../config/imageKit.js";

const conversationService = {
  getPrivateConversations: async (userId, search, cursor, limit = 20) => {
    try {
      if (!userId) throw createError.BadRequest("User ID is required");

      const query = {
        type: "private",
        participants: userId,
      };

      // cursor → date-based
      if (cursor) {
        query.updatedAt = { $lt: new Date(cursor) };
      }

      const conversations = await Conversation.find(query)
        .populate("participants", "username avatar status lastSeen")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username avatar" },
        })
        .sort({ updatedAt: -1 }) // newest first
        .limit(limit)
        .lean();

      // search filter
      let filtered = conversations;
      if (search) {
        const regex = new RegExp(search, "i");
        filtered = conversations.filter((c) =>
          c.participants.some((p) => regex.test(p.username))
        );
      }

      return {
        success: true,
        data: {
          message: "Private conversations retrieved successfully",
          conversations: filtered,
          nextCursor:
            filtered.length > 0
              ? filtered[filtered.length - 1].updatedAt
              : null,
        },
      };
    } catch (error) {
      throw error;
    }
  },
  createConversation: async (userId, participantId) => {
    try {
      if (!userId || !participantId) {
        throw createError.BadRequest("User IDs are required");
      }
      if (userId === participantId) {
        throw createError.BadRequest(
          "Cannot create conversation with yourself"
        );
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
      throw error;
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
        if (msg.mediaPublicId) {
          await imageKit.deleteFile(msg.mediaPublicId);
        }
      }

      await Message.deleteMany({ conversation: conversationId });
      await Conversation.findByIdAndDelete(conversationId);

      return {
        success: true,
        message: "Conversation deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default conversationService;
