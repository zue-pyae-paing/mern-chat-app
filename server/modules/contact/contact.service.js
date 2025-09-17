import User from "../../models/user.model.js";
import { getIO } from "../../socket/socket.js";

const contactService = {
  getContacts: async (userId, search) => {
    try {
      // ကိုယ့်ရဲ့ contacts တွေကို ဆွဲထုတ်မယ်
      const currentUser = await User.findById(userId)
        .select("contacts blocked")
        .populate({
          path: "contacts",
          match: search ? { username: { $regex: search, $options: "i" } } : {}, // optional search
          select: "username avatar status lastSeen",
        })
        .lean();

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Blocked ကို filter လုပ်မယ်
      const contacts = (currentUser.contacts || []).filter(
        (c) => !currentUser.blocked.includes(c._id)
      );

      return {
        success: true,
        data: { message: "Contacts fetched successfully", contacts },
      };
    } catch (error) {
      throw error;
    }
  },
  saveContact: async (userId, contactEmail) => {
    try {
      const user = await User.findById(userId);
      const contactUser = await User.findOne({ email: contactEmail });
      if (!user) {
        throw new Error("User not found");
      }
      if (user.contacts.includes(contactUser._id)) {
        throw new Error("Contact already exists");
      }
      user.contacts.push(contactUser._id);
      await user.save();

      getIO()
        .to(contactUser._id)
        .emit("user:contact", {
          by: userId,
          contact: { _id: contactUser._id, username: contactUser.username },
        });

      return {
        success: true,
        data: { message: "Contact saved successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
   findUser: async (search) => {
    const users = await User.find({
      $or: [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    }).select("username email avatar status");

    return { success: true, users };
  },
  blockUser: async (userId, blockedUserId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.blocked.includes(blockedUserId)) {
        throw new Error("User already blocked");
      }
      user.blocked.push(blockedUserId);
      await user.save();
      return {
        success: true,
        data: { message: "User blocked successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
  unblockUser: async (userId, blockedUserId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.blocked.includes(blockedUserId)) {
        throw new Error("User not blocked");
      }
      user.blocked.pull(blockedUserId);
      await user.save();
      return {
        success: true,
        data: { message: "User unblocked successfully" },
      };
    } catch (error) {
      throw error;
    }
  },
};

export default contactService;
