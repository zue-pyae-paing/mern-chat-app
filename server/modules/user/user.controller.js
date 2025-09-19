import userService from "./user.services.js";

export const getUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log('userId', userId);
    const result = await userService.getUser(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.userId;
    const result = await userService.changePassword(data, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changeUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const userId = req.userId;
    const result = await userService.changeUsername(username, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const changeAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    const userId = req.userId;
    const result = await userService.chageAvatar(file, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const changeBio = async (req, res, next) => {
  try {
    const bio = req.body.bio;
    const userId = req.userId;
    const result = await userService.changeBio(bio, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await userService.deleteAccount(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
