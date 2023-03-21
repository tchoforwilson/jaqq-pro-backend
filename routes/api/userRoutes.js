'use strict';
import { Router } from 'express';
import * as authController from '../../controllers/authController.js';
import * as userController from '../../controllers/userController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/editeProfile',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.editProfile
);

export default router;
