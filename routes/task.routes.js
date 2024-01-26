import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import taskController from '../controllers/task.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';

const router = Router({ mergeParams: true });

router.use(authController.protect);

router.patch(
  '/:id/set-status',
  authController.restrictTo(eUserRole.PROVIDER, eUserRole.USER),
  taskController.toggleTaskStatus
);

router.patch(
  '/:id/in-progress',
  authController.restrictTo(eUserRole.PROVIDER),
  taskController.checkIfTaskExists,
  taskController.setInProgress
);

router.patch(
  '/:id/ready',
  authController.restrictTo(eUserRole.PROVIDER),
  taskController.checkIfTaskExists,
  taskController.setTaskReady
);
router.patch(
  '/:id/approve',
  authController.restrictTo(eUserRole.USER),
  taskController.checkIfTaskExists,
  taskController.setTaskApproved
);
router.patch(
  '/:id/cancel',
  authController.restrictTo(eUserRole.USER),
  taskController.checkIfTaskExists,
  taskController.setTaskCancell
);

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
    taskController.checkIfTaskExists,
    taskController.deleteTask
  );

export default router;
