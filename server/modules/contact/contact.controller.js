import contactService from "./contact.service.js";

export const getContacts = async (req, res, next) => {
  try {
    const search = req.query.search;
    const userId = req.userId;
    const result = await contactService.getContacts(userId, search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const saveContact = async (req, res, next) => {
  try {
    const userId = req.userId;
    const contactEmail = req.body.email;
    const result = await contactService.saveContact(userId, contactEmail);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const blockedUserId = req.params.id;
    const result = await contactService.blockUser(userId, blockedUserId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const blockedUserId = req.params.id;
    const result = await contactService.unblockUser(userId, blockedUserId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const findUser = async (req, res, next) => {
  try {
    const search = req.query.search;
    const result = await contactService.findUser(search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getBlockedUsers = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await contactService.getBlockedUsers(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
