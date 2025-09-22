// message.socket.js
import messageService from "../../modules/messages/message.service.js";

const MessageSocket = (socket, io) => {
  // ✅ Send Message
  socket.on("message:send", async (data, callback) => {
    try {
      const { userId, conversationId, content, files } = data;
      const result = await messageService.sendMessage(userId, conversationId, content, files);
      callback?.({ status: "ok", ...result });
      io.to(conversationId).emit("message:received", result.data.messageData);
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  // ✅ Edit
  socket.on("message:edit", async (data, callback) => {
    try {
      const { userId, messageId, content } = data;
      const result = await messageService.editMessage(userId, messageId, content);
      callback?.({ status: "ok", ...result });
      io.to(result.data.messageData.conversation.toString()).emit(
        "message:edited",
        result.data.messageData
      );
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  // ✅ Reply
  socket.on("message:reply", async (data, callback) => {
    try {
      const { userId, messageId, content } = data;
      const result = await messageService.replyMessage(userId, messageId, content);
      callback?.({ status: "ok", ...result });
      io.to(result.data.messageData.conversation.toString()).emit(
        "message:replied",
        result.data.messageData
      );
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  // ✅ Pin
  socket.on("message:pin", async (data, callback) => {
    try {
      const { messageId } = data;
      const result = await messageService.pinMessage(messageId);
      callback?.({ status: "ok", ...result });
      io.to(result.data.messageData.conversation.toString()).emit(
        "message:pinned",
        result.data.messageData
      );
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  // ✅ Unpin
  socket.on("message:unpin", async (data, callback) => {
    try {
      const { messageId } = data;
      const result = await messageService.unpinMessage(messageId);
      callback?.({ status: "ok", ...result });
      io.to(result.data.messageData.conversation.toString()).emit(
        "message:unpinned",
        result.data.messageData
      );
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  // ✅ Status
  socket.on("message:status", async (data, callback) => {
    try {
      const { messageId, status } = data;
      const result = await messageService.messageStatus(messageId, status);
      callback?.({ status: "ok", ...result });
      io.to(result.data.messageData.conversation.toString()).emit(
        "message:statusUpdated",
        { messageId, status }
      );
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });
};

export default MessageSocket;
