import { Schema, model } from "mongoose";
// message.model.js
const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: {
      type: String,
      required: function () {
        return !this.mediaUrl; // text required only if no media
      },
    },
    type: {
      type: String,
      enum: ["text", "image", "audio", "video", "file"],
      default: "text",
    },
    mediaUrl: { type: String, default: null },
    mediaPublicId: { type: String },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    pinned: { type: Boolean, default: false },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
export default model("Message", messageSchema);
