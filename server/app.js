import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import initSocket from "./socket/socket.js";
import errorHandler from "./middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import conversationRoutes from "./modules/conversation/index.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";

dotenv.config();
const app = express();
const server = createServer(app);

//socket
initSocket(server);

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "Welcome to Chat App" });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/contacts", contactRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/conversations", conversationRoutes);

app.use("/api/v1/messages", messageRoutes);

//error
app.use(errorHandler);

export { app, server };
