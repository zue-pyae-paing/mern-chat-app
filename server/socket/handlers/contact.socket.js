import ContactService from "../../modules/contact/contact.service.js";

const ContactSocket = (socket, io) => {
  socket.on("contact:list", async (data, callback) => {
    try {
      const { userId, search } = data;
      const result = await ContactService.listContacts(userId, search);

      callback?.({ status: "ok", ...result });
      
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on("contact:block", async (data, callback) => {
    try {
      const { userId, blockedUserId } = data;
      const result = await ContactService.blockUser(userId, blockedUserId);

      callback?.({ status: "ok", ...result });
      io.to(blockedUserId.toString()).emit("contact:blocked", { userId });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on("contact:unblock", async (data, callback) => {
    try {
      const { userId, blockedUserId } = data;
      const result = await ContactService.unblockUser(userId, blockedUserId);
      callback?.({ status: "ok", ...result });
      io.to(blockedUserId).emit("contact:unblocked", { userId });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });

  socket.on("contact:list-blocked", async (data, callback) => {
    try {
      const { userId } = data;
      const result = await ContactService.listBlockedUsers(userId);
      callback?.({ status: "ok", ...result });
    } catch (error) {
      callback?.({ status: "error", message: error.message });
    }
  });
};

export default ContactSocket;
