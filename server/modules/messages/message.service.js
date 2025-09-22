// message.service.js
import createError from "http-errors";
import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import { uploadFolder } from "../../utils/uploadFolder.js";
import imagekit from "../../config/imageKit.js";

const messageService = {
  // ✅ Get Messages
  getMessages: async (conversationId, search, limit = 20, cursor) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");

      const query = { conversation: conversationId };
      if (search) query.content = { $regex: search, $options: "i" };
      if (cursor) query.createdAt = { $lt: new Date(cursor) };

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .populate("sender", "username avatar")
        .limit(limit)
        .lean();

      return {
        success: true,
        data: {
          message: "Messages fetched successfully",
          messages,
          nextCursor: messages[messages.length - 1]?.createdAt,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  sendMessage: async (userId, conversationId, content, files) => {
    if (!conversationId)
      throw createError.BadRequest("Conversation ID is required");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw createError.NotFound("Conversation not found");

    const message = new Message({
      sender: userId,
      conversation: conversationId,
      content: files?.length ? "" : content,
    });

    if (files?.length) {
      const uploads = await Promise.all(
        files.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: `message_${Date.now()}_${file.originalname}`,
            folder: uploadFolder(file.mimetype),
            useUniqueFileName: true,
          })
        )
      );

      message.attachments = uploads.map((u, i) => ({
        url: u.url,
        fileId: u.fileId,
        type: files[i].mimetype.startsWith("image/")
          ? "image"
          : files[i].mimetype.startsWith("video/")
          ? "video"
          : files[i].mimetype.startsWith("audio/")
          ? "audio"
          : "file",
      }));
      message.type = "media";
    } else {
      message.type = "text";
    }

    await message.save();

    conversation.lastMessage =
      message.type === "text" ? message.content : `[${message.type}]`;
    await conversation.save();

    return {
      success: true,
      data: { message: "Message sent successfully", messageData: message },
    };
  },
  // ✅ Edit Text Message
  editMessage: async (userId, messageId, content) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw createError.NotFound("Message not found");
      if (message.sender.toString() !== userId)
        throw createError.Forbidden("You are not allowed to edit this message");
      if (["image", "video", "audio", "file"].includes(message.type)) {
        throw createError.BadRequest("You can't edit this type of message");
      }
      if (!content?.trim())
        throw createError.BadRequest("Content cannot be empty");

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();

      return {
        success: true,
        data: { message: "Message edited successfully", messageData: message },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Reply Message
  replyMessage: async (userId, messageId, content) => {
    try {
      const parentMessage = await Message.findById(messageId);
      if (!parentMessage) throw createError.NotFound("Message not found");

      const conversation = await Conversation.findById(
        parentMessage.conversation
      );
      if (!conversation) throw createError.NotFound("Conversation not found");

      const reply = new Message({
        sender: userId,
        conversation: conversation._id,
        content,
        type: "text",
        replyTo: messageId,
      });

      await reply.save();
      conversation.lastMessage = reply.content;
      await conversation.save();

      return {
        success: true,
        data: { message: "Reply sent successfully", messageData: reply },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Single Pin Message System
  pinMessage: async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw createError.NotFound("Message not found");

      // Unpin all other messages in same conversation
      await Message.updateMany(
        { conversation: message.conversation, pinned: true },
        { $set: { pinned: false } }
      );

      message.pinned = true;
      await message.save();

      return {
        success: true,
        data: { message: "Message pinned successfully", messageData: message },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Unpin
  unpinMessage: async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw createError.NotFound("Message not found");
      message.pinned = false;
      await message.save();
      return {
        success: true,
        data: { message: "Message unpinned successfully" },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Get Pinned Message (single only)
  getPinnedMessage: async (conversationId) => {
    try {
      const message = await Message.findOne({
        conversation: conversationId,
        pinned: true,
      }).populate("sender", "username avatar");

      return {
        success: true,
        data: {
          message: message
            ? "Message fetched successfully"
            : "No pinned message",
          messageData: message || null,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Update Message Status (sent, delivered, read)
  messageStatus: async (messageId, status) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw createError.NotFound("Message not found");
      message.status = status;
      await message.save();
      return {
        success: true,
        data: { message: "Message status updated successfully" },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  // ✅ Delete Message
  deleteMessage: async (userId, messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw createError.NotFound("Message not found");
      if (message.sender.toString() !== userId)
        throw createError.Forbidden(
          "You are not allowed to delete this message"
        );

      if (message.mediaPublicId) {
        await imagekit.deleteFile(message.mediaPublicId);
      }

      await Message.findByIdAndDelete(messageId);

      return {
        success: true,
        data: { message: "Message deleted successfully" },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
};

export default messageService;
