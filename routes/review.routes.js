import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import eUserRole from '../utilities/enums/e.user-role.js';
import reviewController from '../controllers/review.controller.js';

const router = Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo(eUserRole.USER),
    reviewController.setUserTaskIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo(eUserRole.USER),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo(eUserRole.USER, eUserRole.ADMIN),
    reviewController.deleteReview
  );

export default router;
