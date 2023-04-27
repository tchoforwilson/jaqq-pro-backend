import User from '../../models/userModel.js';
import authController from './authController.js';

export default {
  resendCode: authController.resendcode(User),
  register: authController.register(User),
  login: authController.login(User),
  verifyMe: authController.verifyMe(User),
  logout: authController.logout,
  protect: authController.protect(User),
  updateContact: authController.updateContact(User),
  updatePassword: authController.updatePassword(User),
};
