import PrivateService from "../../modules/conversation/private/private.service.js";

const PrivateSocket = (socket, io) => {
  // helper → broadcast to both participants
  const notifyParticipants = (conversation, event, payload) => {
    conversation.participants.forEach((participant) => {
      const id = participant._id ? participant._id.toString() : participant.toString();
      io.to(id).emit(event, payload);
    });
  };

  // list private conversations
  socket.on("private:list", async (data, callback) => {
    try {
      const { userId, search, cursor, limit } = data;
      const result = await PrivateService.getPrivateConversations(userId, search, cursor, limit);
      callback?.({ status: "ok", ...result });
    } catch (error) {
      callback?.({ status: "error", message: error.message || "Failed to list conversations" });
    }
  });

  // create new private conversation
  socket.on("conversation:create", async (data, callback) => {
    try {
      const { userId, participantId } = data;
      const result = await PrivateService.createConversation(userId, participantId);
      const conversation = result.data.conversation;

      // join both participants into the room
      [userId, participantId].forEach((id) => {
        const participantSocket = io.sockets.sockets.get(id.toString());
        if (participantSocket) participantSocket.join(conversation._id.toString());
      });

      notifyParticipants(conversation, "conversation:created", conversation);

      callback?.({ status: "ok", ...result });
    } catch (error) {
      callback?.({ status: "error", message: error.message || "Failed to create conversation" });
    }
  });

  // delete private conversation
  socket.on("conversation:delete", async (data, callback) => {
    try {
      const { userId, conversationId } = data;
      const result = await PrivateService.deletePrivateConversation(userId, conversationId);

      io.to(conversationId.toString()).emit("conversation:deleted", result.data);

      callback?.({ status: "ok", ...result });
    } catch (error) {
      callback?.({ status: "error", message: error.message || "Failed to delete conversation" });
    }
  });

  // typing indicator
  socket.on("private:typing", async ({ conversationId }, callback) => {
    try {
      socket.to(conversationId.toString()).emit("private:typing", { conversationId, userId: socket.userId });
      callback?.({ status: "ok", data: { conversationId, userId: socket.userId } });
    } catch (error) {
      callback?.({ status: "error", message: error.message || "Failed to send typing event" });
    }
  });

  // stop typing indicator
  socket.on("private:stop-typing", async ({ conversationId }, callback) => {
    try {
      socket.to(conversationId.toString()).emit("private:stop-typing", { conversationId, userId: socket.userId });
      callback?.({ status: "ok", data: { conversationId, userId: socket.userId } });
    } catch (error) {
      callback?.({ status: "error", message: error.message || "Failed to send stop typing event" });
    }
  });
};

export default PrivateSocket;
