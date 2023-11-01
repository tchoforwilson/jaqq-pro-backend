import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import userController from "../controllers/user.controller.js";
import { uploadPhoto, resizePhoto } from "../utilities/imageUpload.js";
import eUserRole from "../utilities/enums/e.user-role.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);
router.patch("/updatePhone", authController.updatePhone);
router.get("/profile", userController.getMe, userController.getUser);
router.patch("/editProfile", uploadPhoto, resizePhoto, userController.updateMe);
router.delete("/deleteProfile", userController.deleteMe);
router.post("/verifyMe", authController.verifyMe);
router.get("/resendCode", authController.resendSMSCode);

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
