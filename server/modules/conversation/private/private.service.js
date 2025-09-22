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
      if (cursor) {
        query.updatedAt = { $lt: new Date(cursor) };
      }

      // 👉 Search by counterpart username
      let conversationsQuery = Conversation.find(query)
        .populate({
          path: "participants",
          select: "username avatar status lastSeen",
          match: search
            ? { username: { $regex: search, $options: "i", $ne: userId } }
            : {}, // exclude self
        })
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username avatar" },
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();

      let conversations = await conversationsQuery;

      // ❌ Remove convos where only self is left after match
      if (search) {
        conversations = conversations.filter(
          (c) =>
            c.participants.length > 0 &&
            !c.participants.every((p) => p._id.toString() === userId.toString())
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
      throw createError.InternalServerError(error.message);
    }
  },
};

export default conversationService;
