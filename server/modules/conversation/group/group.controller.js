import groupService from "./group.service.js";

export const listGroupsForUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await groupService.listGroupsForUser(
      userId,
      req.query.search,
      req.query.cursor,
      req.query.limit
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const result = await groupService.createGroup({ name, members }, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addGroupMembers = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { members } = req.body;
    const result = await groupService.addGroupMembers(conversationId, members);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeGroupMembers = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { members } = req.body;
    const result = await groupService.removeGroupMembers(conversationId, members);
    res.status(200).json(result);
  } catch (error) {
    throw error;
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const result = await groupService.leaveGroup(conversationId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const renameGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { conversationId } = req.params;
    const result = await groupService.renameGroup(conversationId, name);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changeGroupImage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const file = req.file;
    const result = await groupService.changeGroupImage(conversationId, file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changeGroupDescription = async (req, res, next) => {
  try {
    const { description } = req.body;
    const { conversationId } = req.params;
    const result = await groupService.changeGroupDescription(
      conversationId,
      description
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const transferGroupAdmin = async (req, res, next) => {
  try {
    const { newAdminId } = req.body;
    const { conversationId } = req.params;
    const result = await groupService.transferGroupAdmin(
      conversationId,
      newAdminId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const result = await groupService.deleteGroup(conversationId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

