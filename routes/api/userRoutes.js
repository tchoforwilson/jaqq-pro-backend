import { Router } from 'express';
import * as authController from '../../controllers/authentication/userAuthController.js';
import * as userController from '../../controllers/userController.js';
import { uploadPhoto, resizePhoto } from '../../utilities/imageUpload.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/editProfile', uploadPhoto, resizePhoto, userController.updateMe);

export default router;
