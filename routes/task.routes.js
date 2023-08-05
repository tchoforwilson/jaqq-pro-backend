import { Router } from 'express';
import pricingRouter from './pricing.routes.js';
import authController from '../controllers/auth.controller.js';
import taskController from '../controllers/task.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router();

router.use(authController.protect);

router.use('/:taskId/pricings', pricingRouter);

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(
    authController.restrictTo(eUserRole.PROVIDER),
    taskController.createTask
  );
router
  .route('/:id')
  .get(taskController.getTask)
  .patch(
    authController.restrictTo(eUserRole.PROVIDER),
    taskController.updateTask
  )
  .delete(
    authController.restrictTo(eUserRole.PROVIDER),
    taskController.deleteTask
  );

export default router;
