import User from '../../models/userModel.js';
import authController from './authController.js';

export default {
  register: authController.register(User),
  login: authController.login(User),
  logout: authController.logout,
  protect: authController.protect(User),
  updatePassword: authController.updatePassword(User),
};
