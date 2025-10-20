import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    type: { type: String, enum: ["private", "group"], default: "private" },
    participantKey: { type: String },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    name: {
      type: String,
      default: null,
      maxlength: 50,
      trim: true,
      lowercase: true,
    },
    groupImage: { type: String, default: null },
    groupImagePublicId: { type: String },
    lastMessage: {
      type: String,
      default: null,
    },
    unreadCounts: { type: Map, of: { type: Number, default: 0 }, default: {} },
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    adminId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    groupDescription: { type: String, default: null, maxlength: 150 },
  },
  { timestamps: true }
);
conversationSchema.index(
  { participantKey: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "private" },
    name: "participantKey_private",
  }
);
export default model("Conversation", conversationSchema);
