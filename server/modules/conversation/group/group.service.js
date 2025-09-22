import createError from "http-errors";
import Conversation from "../../../models/conversation.model.js";
import User from "../../../models/user.model.js";
import imageKit from "../../../config/imageKit.js";
import Message from "../../../models/message.model.js";
import { uploadFolder } from "../../../utils/uploadFolder.js";

const groupService = {
  listGroupsForUser: async (userId, search, limit = 20, cursor) => {
    try {
      if (!userId) throw createError.BadRequest("User ID is required");

      const query = {
        type: "group",
        participants: userId,
      };

      // cursor → date-based pagination
      if (cursor) {
        query.updatedAt = { $lt: new Date(cursor) };
      }

      // search by group name only
      if (search) {
        const regex = new RegExp(search, "i");
        query.name = regex;
      }

      const conversations = await Conversation.find(query)
        .populate("participants", "username avatar status lastSeen")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "username avatar" },
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        data: {
          conversations,
          nextCursor:
            conversations.length > 0
              ? conversations[conversations.length - 1].updatedAt
              : null,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  createGroup: async (data, userId) => {
    try {
      const { name, members } = data;

      // add creator + unique
      const allMembers = [...new Set([...members, userId])];

      // validate group uniqueness
      const existsGroup = await Conversation.findOne({
        type: "group",
        participants: { $all: allMembers, $size: allMembers.length },
      });

      if (existsGroup) {
        throw createError.BadRequest(
          "A group with these members already exists."
        );
      }

      if (!name || name.trim() === "") {
        throw createError.BadRequest("Group name is required.");
      }

      if (allMembers.length < 3) {
        throw createError.BadRequest(
          "A group must have at least 3 members including the creator."
        );
      }

      const limitMembers = 20;
      if (allMembers.length > limitMembers) {
        throw createError.BadRequest(
          `You can create a group with a maximum of ${limitMembers} members.`
        );
      }

      // check creator exists
      const user = await User.findById(userId);
      if (!user) throw createError.NotFound("User not found");

      // create group
      const conversation = await Conversation.create({
        name,
        type: "group",
        isGroup: true,
        participants: allMembers,
        adminId: userId,
      });

      return {
        success: true,
        message: "Group created successfully",
        data: { conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  addGroupMembers: async (conversationId, members) => {
    try {
      console.log("conversationId:", conversationId);
      console.log("members:", members);

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");

      if (conversation.type !== "group") {
        throw createError.BadRequest("Not a group conversation");
      }

      // check already existing members in this group
      const alreadyMembers = members.filter((m) =>
        conversation.participants.includes(m)
      );
      if (alreadyMembers.length > 0) {
        throw createError.BadRequest(
          `Some members already exist in this group: ${alreadyMembers.join(
            ", "
          )}`
        );
      }

      // merge old + new unique members
      const allMembers = [
        ...new Set([...conversation.participants, ...members]),
      ];

      // limit max members
      const limitMembers = 20;
      if (allMembers.length > limitMembers) {
        throw createError.BadRequest(
          `You can add a maximum of ${limitMembers} members to a group.`
        );
      }

      conversation.participants = allMembers;
      await conversation.save();

      return {
        success: true,
        data: { message: "Members added successfully", conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  removeGroupMembers: async (conversationId, members) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");

      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");

      // check all members exist in group
      const notInGroup = members.filter(
        (m) =>
          !conversation.participants
            .map((id) => id.toString())
            .includes(m.toString())
      );
      if (notInGroup.length > 0) {
        throw createError.BadRequest(
          `Some members are not in this group: ${notInGroup.join(", ")}`
        );
      }

      // prevent removing the admin
      if (members.includes(conversation.adminId?.toString())) {
        throw createError.BadRequest("Cannot remove the group admin");
      }

      // remove members
      const updatedMembers = conversation.participants.filter(
        (id) => !members.includes(id.toString())
      );

      // check at least 2 members remain
      if (updatedMembers.length <= 2) {
        throw createError.BadRequest("A group must have at least 2 members");
      }

      conversation.participants = updatedMembers;
      await conversation.save();

      return {
        success: true,
        data: { message: "Members removed successfully", conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  leaveGroup: async (conversationId, userId) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");

      if (conversation.adminId?.toString() === userId.toString()) {
        throw createError.BadRequest(
          "Group admin cannot leave the group. Please assign a new admin before leaving."
        );
      }

      if (!conversation.participants.includes(userId)) {
        throw createError.BadRequest("You are not a member of this group");
      }

      if (conversation.participants.length <= 2) {
        throw createError.BadRequest("A group must have at least 2 members");
      }

      if (conversation.participants.includes(userId)) {
        conversation.participants = conversation.participants.filter(
          (id) => id.toString() !== userId.toString()
        );
        await conversation.save();
        return {
          success: true,
          data: { message: "Left the group successfully", conversation },
        };
      } else {
        throw createError.BadRequest("You are not a member of this group");
      }
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  renameGroup: async (conversationId, name) => {
    try {
      if (!name || name.trim() === "") {
        throw createError.BadRequest("Group name is required.");
      }
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");
      conversation.name = name;
      await conversation.save();

      return {
        success: true,
        data: { message: "Group renamed successfully", conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },

  changeGroupImage: async (conversationId, file) => {
    try {
      console.log("conversationId from updateGroupImage:", conversationId);
      if (!file) {
        throw createError.BadRequest("No file uploaded");
      }
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");

      // Delete previous image from ImageKit if exists
      if (conversation.groupImagePublicId) {
        await imageKit.deleteFile(conversation.groupImagePublicId);
      }

      const uploadResult = await imageKit.upload({
        file: file.buffer,
        fileName: `group_${conversationId}_${Date.now()}`,
        folder: uploadFolder(file.mimetype),
        useUniqueFileName: true,
      });
      conversation.groupImage = uploadResult.url;
      conversation.groupImagePublicId = uploadResult.fileId;
      await conversation.save();

      return {
        success: true,
        data: { message: "Group image updated successfully", conversation },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  changeGroupDescription: async (conversationId, description) => {
    try {
      console.log("updateGroupDescription called with:", description);
      if (!description || description.trim() === "") {
        throw createError.BadRequest("Group description is required.");
      }
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");

      conversation.groupDescription = description;
      await conversation.save();
      return {
        success: true,
        data: {
          message: "Group description updated successfully",
          conversation,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  transferGroupAdmin: async (conversationId, newAdminId) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");
      conversation.adminId = newAdminId;
      await conversation.save();
      return {
        success: true,
        data: {
          message: "Group admin changed successfully",
          conversation,
        },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
  deleteGroup: async (conversationId) => {
    try {
      console.log("deleteGroup called with:", conversationId);
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw createError.NotFound("Conversation not found");
      if (conversation.type !== "group")
        throw createError.BadRequest("Not a group conversation");

      const messages = await Message.find({ conversation: conversationId });

      for (const message of messages) {
        if (message.mediaPublicId) {
          await imageKit.deleteFile(message.mediaPublicId);
        }
      }
      if (conversation.groupImagePublicId) {
        await imageKit.deleteFile(conversation.groupImagePublicId);
      }
      await Message.deleteMany({ conversation: conversationId });
      await Conversation.findByIdAndDelete(conversationId);
      return {
        success: true,
        data: { message: "Group deleted successfully" },
      };
    } catch (error) {
      throw createError.InternalServerError(error.message);
    }
  },
};

export default groupService;
