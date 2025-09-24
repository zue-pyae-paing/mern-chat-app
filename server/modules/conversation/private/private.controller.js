import conversationService from "./private.service.js";

export const getAllConversations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await conversationService.getAllConversations(
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

export const createConversation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const participantId = req.params.id;
    const result = await conversationService.createConversation(
      userId,
      participantId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPrivateConversations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await conversationService.getPrivateConversations(
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

export const deletePrivateConversation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const conversationId = req.params.id;
    const result = await conversationService.deletePrivateConversation(
      userId,
      conversationId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
