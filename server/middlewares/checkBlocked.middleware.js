import createError from "http-errors";
import User from "../models/User.js";

const checkBlock = async (req, res, next) => {
  try {
    const userId = req.user.id; // auth middleware က ထွက်လာမယ်
    const participantId = req.body.participantId || req.params.id;

    if (!participantId) {
      throw createError.BadRequest("Participant ID is required");
    }

    // current user + other user
    const [me, other] = await Promise.all([
      User.findById(userId).select("blocked"),
      User.findById(participantId).select("blocked"),
    ]);

    if (!me || !other) {
      throw createError.NotFound("User not found");
    }

    // check blocked relationship
    const iBlockedHim = me.blocked.includes(participantId);
    const heBlockedMe = other.blocked.includes(userId);

    if (iBlockedHim || heBlockedMe) {
      throw createError.Forbidden(
        "You cannot perform this action. One of the users is blocked."
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkBlock;
