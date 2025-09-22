import createError from "http-errors";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const checkBlock = async (req, res, next) => {
  try {
    const userId = req.userId; // ✅ from auth middleware
    const conversationId = req.params.conversationId || req.body.conversationId;
    const participantId = req.body.participantId || req.params.id;

    // Conversation check (if conversationId exists)
    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");

      // only check for private conversations
      if (conversation.type === "group") return next();

      // participantId fallback (find other user in private chat)
      const otherId = conversation.participants.find(
        (id) => id.toString() !== userId.toString()
      );
      if (!otherId) throw createError.BadRequest("Invalid conversation");
      return await blockCheck(userId, otherId, next);
    }

    // If no conversationId, fall back to participantId (e.g. starting new private chat)
    if (!participantId) {
      throw createError.BadRequest("Participant ID is required");
    }

    await blockCheck(userId, participantId, next);
  } catch (err) {
    next(err);
  }
};

const blockCheck = async (userId, otherId, next) => {
  const [me, other] = await Promise.all([
    User.findById(userId).select("blocked"),
    User.findById(otherId).select("blocked"),
  ]);

  if (!me || !other) {
    throw createError.NotFound("User not found");
  }

  const iBlockedHim = me.blocked.some((id) => id.toString() === otherId.toString());
  const heBlockedMe = other.blocked.some((id) => id.toString() === userId.toString());

  if (iBlockedHim || heBlockedMe) {
    throw createError.Forbidden(
      "You cannot perform this action. One of the users is blocked."
    );
  }

  next();
};

export default checkBlock;
