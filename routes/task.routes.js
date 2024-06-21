import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import taskController from '../controllers/task.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo(eUserRole.USER),
    taskController.setTaskUserId,
    taskController.createTask
  )
  .get(taskController.getAllTasks);

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(
    authController.restrictTo(eUserRole.USER),
    taskController.setTaskUserId,
    taskController.updateTask
  )
  .delete(
    authController.restrictTo(eUserRole.ADMIN, eUserRole.USER),
    taskController.deleteTask
  );

export default router;
