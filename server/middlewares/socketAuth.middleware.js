import { verifyToken } from "../utils/token.js";
import createError from "http-errors";

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(createError.Unauthorized());

    const decoded = verifyToken(token);
    socket.userId = decoded.id;
    socket.userName = decoded.name;
    console.log("Socket authenticated:", decoded);
    next();
  } catch (error) {
    next(createError.Unauthorized());
  }
};

export default socketAuth;
