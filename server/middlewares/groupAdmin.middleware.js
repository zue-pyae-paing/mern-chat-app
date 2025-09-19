import createError from "http-errors";
import Conversation from "../models/conversation.model.js";

const isGroupAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params; 
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(createError.NotFound("Conversation not found"));
    }

    if (!conversation.participants.map(String).includes(userId.toString())) {
      return next(
        createError.Forbidden("You are not a participant of this group")
      );
    }

    if (!conversation.adminId) {
      return next(createError.Forbidden("This group has no admin set"));
    }

    if (conversation.adminId.toString() !== userId.toString()) {
      return next(createError.Forbidden("You are not an admin of this group"));
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};

export default isGroupAdmin;
