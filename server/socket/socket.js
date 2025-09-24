import { Server } from "socket.io";
import socketAuth from "../middlewares/socketAuth.middleware.js";
import User from "../models/user.model.js";
import GroupSocket from "./handlers/group.socket.js";
import ContactSocket from "./handlers/contact.socket.js";
import PrivateSocket from "./handlers/private.socket.js";
import MessageSocket from "./handlers/message.socket.js";

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //socket middleware
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    socket.join(socket.userId);
    await User.findByIdAndUpdate(socket.userId, { status: "online" });
    io.emit("user:online", { userId: socket.userId });

    //handlers
    ContactSocket(socket, io);
    PrivateSocket(socket, io);
    GroupSocket(socket, io);
    MessageSocket(socket, io);

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
