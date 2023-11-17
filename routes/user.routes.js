import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import userController from "../controllers/user.controller.js";
import taskRouter from "./task.routes.js";
import { uploadPhoto, resizePhoto } from "../utilities/imageUpload.js";
import eUserRole from "../utilities/enums/e.user-role.js";

const router = Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Fetching and creating provider tasks
router.use("/:userId/taks", taskRouter);

// User routes
router.get("/me", userController.getMe, userController.getUser);
router.patch("/update-me", uploadPhoto, resizePhoto, userController.updateMe);
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
