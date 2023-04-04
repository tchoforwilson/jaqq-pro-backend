import { Router } from 'express';
import authController from '../../controllers/authentication/userAuthController.js';
import userController from '../../controllers/userController.js';
import { uploadPhoto, resizePhoto } from '../../utilities/imageUpload.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/profile', userController.getMe, userController.getUser);
router.patch('/editProfile', uploadPhoto, resizePhoto, userController.updateMe);
router.delete('/deleteProfile', userController.deleteMe);

// TODO: This routes below should be restricted to an admin user

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
