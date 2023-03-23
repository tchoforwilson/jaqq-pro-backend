import { Router } from 'express';
import pricingRouter from './pricingRoutes.js';
import * as authController from '../../controllers/authentication/providerAuthController.js';
import * as taskController from '../../controllers/taskController.js';

const router = Router();

router.use(authController.protect);

router.use('/:taskId/pricings', pricingRouter);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);
router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;
