import { Server } from "socket.io";
import socketAuth from "./socketAuth.middleware.js";
import User from "../../models/user.model.js";
let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
   
    socket.join(socket.userId);

    await User.findByIdAndUpdate(socket.userId, { status: "online" });

    io.emit("user:online", { userId: socket.userId });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.userId, {
        status: "offline",
        lastSeen: Date.now(),
      });
      
      io.emit("user:offline", { userId: socket.userId, lastSeen: Date.now() });
    });
  });
  return io;
};

export default initSocket;
export const getIO = () => io;
