import { Router } from 'express';
import * as authController from '../../controllers/authentication/providerAuthController.js';
import * as providerController from '../../controllers/providerController.js';
import { uploadPhoto, resizePhoto } from '../../utilities/imageUpload.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/editProfile',
  uploadPhoto,
  resizePhoto,
  providerController.updateMe
);

export default router;
