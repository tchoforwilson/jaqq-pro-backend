import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import serviceController from '../controllers/service.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router();

router.use(authController.protect);

// TODO: Check if admin contact needs to be verified before actions
router
  .route('/')
  .get(serviceController.getAllServices)
  .post(
    authController.restrictTo(eUserRole.ADMIN),
    serviceController.createService
  );

router
  .route('/:id')
  .patch(
    authController.restrictTo(eUserRole.ADMIN),
    serviceController.updateService
  )
  .get(serviceController.getService)
  .delete(
    authController.restrictTo(eUserRole.ADMIN),
    serviceController.deleteService
  );

export default router;
