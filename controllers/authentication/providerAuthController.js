import Provider from '../../models/providerModel.js';
import authController from './authController.js';

export default {
  register: authController.register(Provider),
  login: authController.login(Provider),
  logout: authController.logout,
  protect: authController.protect(Provider),
  updatePassword: authController.updatePassword(Provider),
};
