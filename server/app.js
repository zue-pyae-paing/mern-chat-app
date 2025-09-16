import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routers.js";

dotenv.config();
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

//error
app.use(errorHandler);

export default app;
