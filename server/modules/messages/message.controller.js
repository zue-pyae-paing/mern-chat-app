import messageService from "./message.service.js";

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { search, limit, cursor } = req.query;
    const messages = await messageService.getMessages(
      conversationId,
      search,
      limit,
      cursor
    );
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { content } = req.body;
    const files = req.files;
    const message = await messageService.sendMessage(
      userId,
      conversationId,
      content,
      files
    );
    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { conversationId, messageId } = req.params;
    const result = await messageService.deleteMessage(
      userId,
      conversationId,
      messageId
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { messageId, conversationId } = req.params;
    const { content } = req.body;
    const result = await messageService.editMessage(
      userId,
      conversationId,
      messageId,
      content
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const replyToMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { conversationId, messageId } = req.params;
    const { content } = req.body;
    const result = await messageService.replyMessage(
      userId,
      conversationId,
      messageId,
      content
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const pinMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const result = await messageService.pinMessage(conversationId, messageId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const unpinMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const result = await messageService.unpinMessage(conversationId, messageId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPinnedMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const result = await messageService.getPinnedMessage(conversationId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const messageStatus = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const { status } = req.body;
    const result = await messageService.messageStatus(
      conversationId,
      messageId,
      status
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
