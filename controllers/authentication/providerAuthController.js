import Provider from '../../models/providerModel.js';
import authController from './authController.js';

export default {
  resendCode: authController.resendcode(Provider),
  register: authController.register(Provider),
  login: authController.login(Provider),
  verifyMe: authController.verifyMe(Provider),
  logout: authController.logout,
  protect: authController.protect(Provider),
  updateContact: authController.updateContact(Provider),
  updatePassword: authController.updatePassword(Provider),
};
