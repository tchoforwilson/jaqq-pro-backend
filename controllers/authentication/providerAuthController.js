'use strict';
import Provider from '../../models/providerModel.js';
import * as authController from './authController.js';

export const register = authController.register(Provider);
export const login = authController.login(Provider);
export const logout = authController.logout;
export const protect = authController.protect(Provider);
export const updatePassword = authController.updatePassword(Provider);
