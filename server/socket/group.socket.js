import { getIO } from "./socket.js";

const groupSocket = (socket) => {
  socket.on("group:join", async (data) => {
    const { groupId } = data;
    socket.join(groupId);
  });
  socket.on("group:leave", async (data) => {
    const { groupId } = data;
    socket.leave(groupId);
  });
  socket.on("group:typing", async (data) => {
    const { groupId } = data;
    const io = getIO();
    io.to(groupId).emit("group:typing", data);
  });
  socket.on("group:stopTyping", async (data) => {
    const { groupId } = data;
    const io = getIO();
    io.to(groupId).emit("group:stopTyping", data);
  });
};
export default groupSocket;