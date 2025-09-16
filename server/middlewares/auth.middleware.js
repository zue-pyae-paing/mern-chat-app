import { verifyToken } from "../utils/token.js";

const authorize = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    next(err);
  }
};

export default authorize;
