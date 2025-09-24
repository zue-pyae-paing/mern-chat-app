import contactService from "./contact.service.js";

export const listContacts = async (req, res, next) => {
  try {
    const search = req.query.search;
    const userId = req.userId;
    const result = await contactService.listContacts(userId, search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addContact = async (req, res, next) => {
  try {
    const userId = req.userId;
    const contactEmail = req.body.email;
    const result = await contactService.addContact(userId, contactEmail);
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

export const searchUsers = async (req, res, next) => {
  try {
    const search = req.query.search;
    const result = await contactService.searchUsers(search);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listBlockedUsers = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await contactService.listBlockedUsers(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const userId = req.userId;
    const contactId = req.params.id;
    const result = await contactService.deleteContact(userId, contactId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};