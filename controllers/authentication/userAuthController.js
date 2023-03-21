'use strict';
import User from '../../models/userModel.js';
import * as authController from './authController.js';

export const register = authController.register(User);
export const login = authController.login(User);
export const logout = authController.logout;
export const protect = authController.protect(User);
export const updatePassword = authController.updatePassword(User);
