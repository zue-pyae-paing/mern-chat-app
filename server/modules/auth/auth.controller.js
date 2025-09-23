import authService from "./auth.service.js";
import sendMail from "../../config/sendMail.js";

export const register = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await authService.login(data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const result = await authService.forgotPassword(email);
    const resetLink = `http://localhost:3000/reset-password/${result.resetToken}`;
    await sendMail({
      to: email,
      subject: "Reset Password",
      text: `Click the link to reset your password: ${resetLink}`,
    });
    res.status(200).json({
      success: true,
      data: { message: "Password reset email sent successfully" },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.password;
    const result = await authService.resetPassword(resetToken, newPassword);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
