import { Router } from 'express';
import authController from '../../controllers/authentication/providerAuthController.js';
import providerController from '../../controllers/providerController.js';
import { uploadPhoto, resizePhoto } from '../../utilities/imageUpload.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get(
  '/profile',
  providerController.getMe,
  providerController.getProvider
);
router.patch(
  '/editProfile',
  uploadPhoto,
  resizePhoto,
  providerController.updateMe
);
router.delete('/deleteProfile', providerController.deleteMe);

// TODO: this routes here should be restricted to a user with role "admin"

router
  .route('/')
  .get(providerController.getAllProviders)
  .post(providerController.createProvider);

router
  .route('/:id')
  .get(providerController.getProvider)
  .patch(providerController.updateProvider)
  .delete(providerController.deleteProvider);

export default router;
