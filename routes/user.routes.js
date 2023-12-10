import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import userController from "../controllers/user.controller.js";
import taskRouter from "./task.routes.js";
import eUserRole from "../utilities/enums/e.user-role.js";

const router = Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Fetching and creating provider tasks
router.use("/:userId/taks", taskRouter);

router.route("/search", userController.searchUser);
router.route("/count", userController.countUsers);

// User routes
router.get("/me", userController.getMe, userController.getUser);
router.patch("/update-me", userController.updateMe);
router.patch(
  "/update-photo",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.patch(
  "/toggle-services",
  authController.restrictTo(eUserRole.PROVIDER),
  userController.toggleMyServices
);
router.delete("/delete-me", userController.deleteMe);

router.use(authController.restrictTo(eUserRole.ADMIN));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
