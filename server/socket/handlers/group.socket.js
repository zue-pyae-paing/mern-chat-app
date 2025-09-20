import groupService from "../../modules/conversation/group/group.service.js";

const GroupSocket = (socket, io) => {
  // Helper function → broadcast to all members
  const broadcastToParticipants = (conversation, event, payload) => {
    conversation.participants.forEach((participant) => {
      const id = participant._id
        ? participant._id.toString()
        : participant.toString();
      io.to(id).emit(event, payload);
    });
  };

  socket.on("group:create", async ({ name, members }, callback) => {
    try {
      const result = await groupService.createGroup(
        { name, members },
        socket.userId
      );
      const conversation = result.data.conversation;

      socket.join(conversation._id.toString()); // creator join

      broadcastToParticipants(conversation, "group:created", conversation);

      callback?.({ status: "success", data: conversation });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on("group:rename", async ({ conversationId, name }, callback) => {
    try {
      const result = await groupService.renameGroup(conversationId, name);
      const conversation = result.data.conversation;

      broadcastToParticipants(conversation, "group:renamed", conversation);

      callback?.({ status: "success", data: conversation });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on(
    "group:update-image",
    async ({ conversationId, file }, callback) => {
      try {
        const result = await groupService.changeGroupImage(
          conversationId,
          file
        );
        const conversation = result.data.conversation;

        broadcastToParticipants(
          conversation,
          "group:image-updated",
          conversation
        );

        callback?.({ status: "success", data: conversation });
      } catch (error) {
        callback?.({ status: "error", message: error.message });
      }
    }
  );

  socket.on(
    "group:update-description",
    async ({ conversationId, description }, callback) => {
      try {
        const result = await groupService.changeGroupDescription(
          conversationId,
          description
        );
        const conversation = result.data.conversation;

        broadcastToParticipants(
          conversation,
          "group:description-updated",
          conversation
        );

        callback?.({ status: "success", data: conversation });
      } catch (error) {
        callback?.({ status: "error", message: error.message });
      }
    }
  );

  socket.on(
    "group:add-members",
    async ({ conversationId, members }, callback) => {
      try {
        const result = await groupService.addGroupMembers(
          conversationId,
          members
        );
        const conversation = result.data.conversation;

        // join new members to the room
        members.forEach((id) => {
          const memberSocket = io.sockets.sockets.get(id);
          if (memberSocket) memberSocket.join(conversationId.toString());
        });

        broadcastToParticipants(
          conversation,
          "group:members-added",
          conversation
        );

        callback?.({ status: "success", data: conversation });
      } catch (error) {
        callback?.({ status: "error", message: error.message });
      }
    }
  );

  socket.on(
    "group:remove-members",
    async ({ conversationId, members }, callback) => {
      try {
        const result = await groupService.removeGroupMembers(
          conversationId,
          members
        );
        const conversation = result.data.conversation;

        broadcastToParticipants(
          conversation,
          "group:members-removed",
          conversation
        );

        callback?.({ status: "success", data: conversation });
      } catch (error) {
        callback?.({ status: "error", message: error.message });
      }
    }
  );

  socket.on(
    "group:transfer-admin",
    async ({ conversationId, newAdminId }, callback) => {
      try {
        const result = await groupService.transferGroupAdmin(
          conversationId,
          newAdminId
        );
        const conversation = result.data.conversation;

        broadcastToParticipants(
          conversation,
          "group:admin-transferred",
          conversation
        );

        callback?.({ status: "success", data: conversation });
      } catch (error) {
        callback?.({ status: "error", message: error.message });
      }
    }
  );

  socket.on("group:delete", async ({ conversationId }, callback) => {
    try {
      const result = await groupService.deleteGroup(conversationId);

      // emit to all existing members
      io.to(conversationId.toString()).emit("group:deleted", result.data);

      callback?.({ status: "success", data: result.data });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on("group:leave", async ({ conversationId }, callback) => {
    try {
      const result = await groupService.leaveGroup(
        conversationId,
        socket.userId
      );
      const conversation = result.data.conversation;

      socket.leave(conversationId.toString()); // user leave room

      broadcastToParticipants(conversation, "group:left", conversation);

      callback?.({ status: "success", data: conversation });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });
  socket.on("group:typing", async ({ conversationId }, callback) => {
    try {
      socket
        .to(conversationId)
        .emit("group:typing", { conversationId, userId: socket.userId });
      callback?.({
        status: "success",
        data: { conversationId, userId: socket.userId },
      });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });
  socket.on("group:stop-typing", async ({ conversationId }, callback) => {
    try {
      socket
        .to(conversationId)
        .emit("group:stop-typing", { conversationId, userId: socket.userId });
      callback?.({
        status: "success",
        data: { conversationId, userId: socket.userId },
      });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });
};

export default GroupSocket;
